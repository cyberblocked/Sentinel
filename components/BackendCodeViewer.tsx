import React from 'react';

export const BackendCodeViewer: React.FC = () => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white mb-2">Node.js Backend Logic</h2>
                <p className="text-slate-400 text-sm">
                    This code runs the actual Puppeteer browser instance. 
                    Copy the contents of <code className="text-indigo-400 bg-indigo-900/30 px-1 rounded">server.js</code> and <code className="text-indigo-400 bg-indigo-900/30 px-1 rounded">package.json</code> below to your local machine to run the full agent.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                <div className="p-0">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 font-mono text-xs text-slate-500">
                        server.js
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto">
{`const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

const app = express();
const port = 3001;

// ... (See "backend/server.js" for boilerplate)

async function runAgentLoop(page, goal) {
    try {
        const screenshot = await page.screenshot({ encoding: 'base64' });
        
        // 1. FAST LOOK (Flash)
        const fastAnalysis = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { mimeType: 'image/png', data: screenshot } }, { text: goal }] }
        });
        
        // ... Execute action ...

        // 2. SELF-HEAL (Pro Thinking) - Only on error
        // If action fails:
        const healingResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            config: { thinkingConfig: { thinkingBudget: 32768 } },
            contents: { 
                parts: [
                    { inlineData: { mimeType: 'image/png', data: screenshot } }, 
                    { text: "Why did the last click fail? Provide a workaround." }
                ] 
            }
        });
        console.log(healingResponse.text); // Diagnosis and fix
    } catch (e) {
        // ...
    }
}
`}
                    </pre>
                </div>
                <div className="p-0">
                     <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 font-mono text-xs text-slate-500">
                        package.json
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
{`{
  "name": "sentinel-backend",
  "dependencies": {
    "@google/genai": "^0.1.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "puppeteer": "^21.5.0"
  }
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
};