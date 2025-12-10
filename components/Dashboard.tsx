import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Loader2, Globe, AlertTriangle, Terminal, BrainCircuit, Cpu } from 'lucide-react';
import { simulateBrowserAgent } from '../services/simulationService';
import { LogMessage } from '../types';

export const Dashboard: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [goal, setGoal] = useState('Find and click the "Sign Up" button');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [mode, setMode] = useState('connected');
  
  // Ref for auto-scrolling logs
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Polling for backend logs when in 'connected' mode
  useEffect(() => {
    let interval: any;
    if (isRunning && mode === 'connected') {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:3001/logs');
          if (!res.ok) return;
          const newLogs = await res.json();
          if (newLogs && newLogs.length > 0) {
            setLogs(prev => {
                // Avoid duplicates if IDs are stable, but simpler just to append for now as backend clears buffer
                return [...prev, ...newLogs];
            });
            
            // Check for screenshot in logs
            const lastScreenshotLog = newLogs
                .filter((l: LogMessage) => l.metadata?.imageUrl)
                .pop();
            
            if (lastScreenshotLog) {
                setScreenshot(lastScreenshotLog.metadata.imageUrl);
            }
          }
        } catch (error) {
          console.error("Failed to fetch logs:", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const handleStart = async () => {
    if (!url || !goal) return;
    
    // 1. Reset the UI State
    setIsRunning(true);
    setLogs([]);
    setScreenshot(null);
    
    // 2. Add System Logs
    addLog('system', `Initializing Sentinel...`);
    addLog('system', `Target: ${url}`);
    addLog('system', `Goal: ${goal}`);

    // 3. Connect to Real Backend (No Simulation check needed)
    try {
        const res = await fetch('http://localhost:3001/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, goal })
        });
        
        if (!res.ok) throw new Error('Backend failed to start');
        
        addLog('system', 'Connected to backend. Session started.');
        
    } catch (error) {
        // If the backend isn't running, this tells you immediately
        console.error(error);
        addLog('error', 'Connection failed. Is "node server.js" running?');
        setIsRunning(false);
    }
  };


  const handleStop = async () => {
    if (mode === 'connected') {
        try {
            await fetch('http://localhost:3001/stop', { method: 'POST' });
        } catch (e) { console.error(e); }
    }
    setIsRunning(false);
    addLog('system', 'Agent stopped by user.');
  };

  const addLog = (type: LogMessage['type'], message: string, metadata?: any) => {
    setLogs(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      metadata
    }]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* Left Column: Controls & Visuals */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Controls Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="https://..."
                    disabled={isRunning}
                  />
                </div>
              </div>
              <div className="w-1/3">
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                 <select 
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    disabled={isRunning}
                 >
                    <option value="simulation">Browser Simulation</option>
                    <option value="connected">Live Backend (Local)</option>
                 </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agent Goal</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none h-24"
                placeholder="Describe exactly what the agent should do..."
                disabled={isRunning}
              />
            </div>

            <div className="flex justify-end pt-2">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  Start Agent
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop Agent
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live View / Screenshot */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              Agent Vision
            </h3>
            {isRunning && <span className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Processing
            </span>}
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center min-h-[300px]">
            {screenshot ? (
                <img src={screenshot} alt="Agent View" className="max-w-full max-h-full object-contain" />
            ) : (
                <div className="text-center text-slate-600 p-8">
                    <div className="w-16 h-16 border-2 border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 opacity-50" />
                    </div>
                    <p>No active session. Start the agent to see its vision.</p>
                </div>
            )}
            
            {/* Thinking Overlay - Show last reasoning thought */}
            {logs.length > 0 && logs[logs.length - 1].type === 'thinking' && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            <h4 className="font-semibold text-indigo-100">Thinking...</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {logs[logs.length - 1].message}
                        </p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Logs */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">Live Reasoning Logs</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {logs.length === 0 && (
                <div className="text-slate-600 text-center py-10 italic">
                    Ready to initialize...
                </div>
            )}
            {logs.map((log) => (
                <div key={log.id} className="animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="min-w-[4.5rem] text-slate-500 text-[10px] pt-0.5">{log.timestamp}</div>
                        <div className="flex-1">
                            <LogIcon type={log.type} />
                            <div className={`mt-1 ${getLogColor(log.type)}`}>
                                {log.message}
                            </div>
                            {log.metadata && log.type !== 'screenshot' && (
                                <pre className="mt-2 p-2 bg-black/30 rounded border border-slate-800 text-slate-400 overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

const LogIcon = ({ type }: { type: LogMessage['type'] }) => {
    switch (type) {
        case 'action': return <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider text-[10px]"><Cpu className="w-3 h-3"/> Action</span>;
        case 'thinking': return <span className="inline-flex items-center gap-1 text-indigo-400 font-bold uppercase tracking-wider text-[10px]"><BrainCircuit className="w-3 h-3"/> Reasoning</span>;
        case 'error': return <span className="inline-flex items-center gap-1 text-rose-400 font-bold uppercase tracking-wider text-[10px]"><AlertTriangle className="w-3 h-3"/> Error</span>;
        case 'screenshot': return <span className="inline-flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider text-[10px]"><Globe className="w-3 h-3"/> Vision</span>;
        default: return <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">System</span>;
    }
};

const getLogColor = (type: LogMessage['type']) => {
    switch (type) {
        case 'action': return 'text-emerald-100';
        case 'thinking': return 'text-indigo-100 italic';
        case 'error': return 'text-rose-200 bg-rose-500/10 p-2 rounded';
        case 'screenshot': return 'text-cyan-100';
        default: return 'text-slate-300';
    }
};