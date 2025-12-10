import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { BackendCodeViewer } from './components/BackendCodeViewer';
import { Activity, Code, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'backend'>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Sentinel
                </h1>
                <p className="text-xs text-slate-400">Agentic Key Rotation</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                Live Dashboard
              </button>
              <button
                onClick={() => setActiveTab('backend')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeTab === 'backend'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Code className="w-4 h-4" />
                Backend Code
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? <Dashboard /> : <BackendCodeViewer />}
      </main>
    </div>
  );
}