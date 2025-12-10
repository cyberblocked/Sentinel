/**
 * Sentinel Backend Server
 * 
 * To run this:
 * 1. Navigate to this directory
 * 2. npm install
 * 3. Set API_KEY in .env or environment
 * 4. node server.js
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Active browser session
let browser = null;
let page = null;

// Helper to send logs to client (simplified for this example)
// In production, use SSE (Server Sent Events)
let logBuffer = [];
const log = (type, message, metadata = null) => {
    const entry = { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), type, message, metadata };
    logBuffer.push(entry);
    console.log(`[${type.toUpperCase()}] ${message}`);
};

app.get('/logs', (req, res) => {
    res.json(logBuffer);
    logBuffer = []; // Clear buffer after read
});

app.post('/start', async (req, res) => {
    const { url, goal } = req.body;
    logBuffer = []; // Reset logs
    
    try {
        log('system', `Initializing Sentinel session...`);
        log('system', `Target URL: ${url}`);
        
        browser = await puppeteer.launch({
            headless: false, // Visible as requested
            defaultViewport: { width: 1280, height: 800 },
            args: ['--no-sandbox']
        });
        
        page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Start the Agent Loop asynchronously
        runAgentLoop(page, goal);
        
        res.json({ status: 'started' });
    } catch (error) {
        log('error', `Failed to launch: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/stop', async (req, res) => {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
        log('system', 'Browser closed. Session ended.');
    }
    res.json({ status: 'stopped' });
});

async function runAgentLoop(page, goal) {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
        try {
            log('screenshot', 'Capturing visual state for analysis...');
            const screenshot = await page.screenshot({ encoding: 'base64' });
            
            // Send screenshot to frontend via log metadata (careful with payload size in prod)
            log('screenshot', 'Screenshot captured.', { imageUrl: `data:image/png;base64,${screenshot}` });
            
            // Phase 1: FAST Analysis (Gemini Flash)
            log('thinking', 'Visual analysis in progress. Identifying interactive elements using Gemini 1.5 Flash...');
            
            const fastAnalysis = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: screenshot } },
                        { text: `Goal: ${goal}. Return JSON with "selector" (CSS selector) and "actionType" (click/type).` }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            selector: { type: Type.STRING },
                            actionType: { type: Type.STRING }
                        }
                    }
                }
            });
            
            const actionPlan = JSON.parse(fastAnalysis.text);
            log('action', `Plan formulated: ${actionPlan.actionType} on ${actionPlan.selector}`);
            
            // Execute Action
            if (actionPlan.actionType === 'click') {
                log('action', `Executing CLICK on ${actionPlan.selector}`);
                await page.waitForSelector(actionPlan.selector, { timeout: 5000 });
                await page.click(actionPlan.selector);
            } else if (actionPlan.actionType === 'type') {
                 // Simplified for demo
                 log('action', `Executing TYPE on ${actionPlan.selector}`);
                await page.type(actionPlan.selector, "Test Input");
            }
            
            log('system', 'Action executed successfully. Verifying state...');
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
            
        } catch (error) {
            log('error', `Action failed: ${error.message}`);
            
            // Phase 2: SELF-HEALING / REASONING (Gemini Pro Thinking)
            log('thinking', 'Error detected. Engaging deep reasoning loop (Gemini 3 Pro) to diagnose and heal...');
            
            const screenshot = await page.screenshot({ encoding: 'base64' });
             // Update frontend view with error state
            log('screenshot', 'Capturing error state...', { imageUrl: `data:image/png;base64,${screenshot}` });
            
            const healingResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: screenshot } },
                        { text: `The last action failed with error: "${error.message}". Analyze the visual state. Why did it fail? Give me a fix strategy.` }
                    ]
                },
                config: {
                    thinkingConfig: { thinkingBudget: 32768 } // Deep thinking for recovery
                }
            });
            
            log('thinking', `Diagnosis complete: ${healingResponse.text}`);
            
            // In a real app, we would parse a new action from this diagnosis and retry
            // For now, we break to avoid infinite loops in demo
            break;
        }
    }
}

app.listen(port, () => {
    console.log(`Sentinel backend running at http://localhost:${port}`);
});