Sentinel
An autonomous browser automation agent with real-time monitoring and error recovery capabilities.
Overview
Sentinel is an agentic system that uses Gemini 2.5 Pro with Thinking Mode to autonomously navigate web pages and recover from errors. Unlike simple retry logic, Sentinel reasons through navigation failures—diagnosing issues and adapting its approach in real-time.
This project was built with AI safety principles in mind: agentic systems need observability baked in, not bolted on. The monitoring dashboard provides real-time visibility into agent decision-making and actions.
Features

Autonomous Error Recovery: Agent reasons through navigation failures and adapts its strategy
Real-Time Monitoring Dashboard: React-based UI for observing agent actions as they happen
Thinking Mode Integration: Leverages Gemini 2.5 Pro's reasoning capabilities for robust decision-making
Browser Automation: Full browser control via Puppeteer

Tech Stack

Frontend: React, TypeScript
Backend: Node.js, Puppeteer
LLM: Gemini 2.5 Pro with Thinking Mode

Getting Started
Prerequisites

Node.js
Gemini API key

Installation

Clone the repository
Install dependencies: npm install
Create a .env.local file and add your Gemini API key
Run the application: npm run dev

Project Structure

backend/ — Node.js server + Puppeteer browser control
components/ — React UI components
services/ — LLM integration + agent logic
App.tsx — Main application
index.tsx — Entry point

Why This Matters
As AI agents become more capable, oversight and observability become critical. Sentinel demonstrates that monitoring can be a first-class feature of agentic systems—not an afterthought.
Author
Lesley Ward — GitHub
