import { GoogleGenAI, Type } from "@google/genai";
import { LogMessage } from '../types';

// Images for simulation
const MOCK_LOGIN_SCREEN = "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=1280&auto=format&fit=crop"; 
const MOCK_ERROR_SCREEN = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1280&auto=format&fit=crop";

export const simulateBrowserAgent = async (
  targetUrl: string, 
  userGoal: string, 
  onLog: (log: LogMessage) => void
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'API Key not found. Please set REACT_APP_GEMINI_API_KEY or process.env.API_KEY.'
    });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Step 1: Analyze "Screenshot" (Simulation)
  onLog({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'screenshot',
    message: 'Capturing page state...',
    metadata: { imageUrl: MOCK_LOGIN_SCREEN }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Step 2: Gemini Thinking (Initial Plan)
  onLog({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'thinking',
    message: 'Analyzing page structure to identify interactive elements...',
  });

  try {
    // We use gemini-3-pro-preview for the reasoning capability
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
            You are a browser automation agent. 
            Goal: ${userGoal}
            Context: The user is on ${targetUrl}.
            Image: [Simulated Browser Screenshot of a login page]
            
            Identify the likely CSS selector or coordinates for the element that needs to be interacted with.
            Return a JSON object with "action", "selector", and "reasoning".
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    selector: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                }
            }
        }
    });

    const plan = JSON.parse(response.text || '{}');
    
    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: `Plan formed: ${plan.action}`,
        metadata: plan
    });

    await new Promise(r => setTimeout(r, 1500));

    // Step 3: Simulate Action & Failure
    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: `Executing: Click ${plan.selector || '.btn-primary'}`,
    });

    await new Promise(r => setTimeout(r, 1000));

    // Simulate Error
    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'Action Failed: ElementClickInterceptedException. Element is obscured by popup.',
        metadata: { imageUrl: MOCK_ERROR_SCREEN }
    });

    // Step 4: Self-Healing / Reasoning Loop
    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'thinking',
        message: 'Error detected. Entering Deep Reasoning mode to diagnose and fix...',
    });

    // CRITICAL: Using Thinking Config for complex recovery
    const healingResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
            The last action failed with 'ElementClickInterceptedException'.
            Goal: ${userGoal}
            
            Analyze the situation. Why did it fail? What is the alternative path?
            Thinking Process:
            1. Analyze the error.
            2. Look for obstructing elements (popups, overlays).
            3. Formulate a recovery plan (e.g., close popup first).
        `,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }, // High budget for deep reasoning
        }
    });

    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'thinking',
        message: 'Recovery Strategy:',
        metadata: { analysis: healingResponse.text }
    });

    await new Promise(r => setTimeout(r, 1000));

    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'action',
        message: 'Executing Recovery: Close modal dialog with selector .modal-close-btn',
    });

    onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        message: 'Recovery successful. Resuming original task...',
    });

  } catch (error) {
      console.error(error);
      onLog({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        message: 'AI Processing Failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    });
  }
};