# FutureSpend — Mountain Madness 2026

A small hackathon app that predicts upcoming spending by combining calendar events and transaction data with AI.

## Prerequisites

- Node.js 16+ installed (for both client and server)

## Quick Start

```bash
# server
cd server && npm install && npm run dev

# client
cd client && npm install && npm run dev
```

Frontend runs on http://localhost:5173; it proxies `/api` to the server at port 3001.

## Demo highlights

1. Dashboard – weekly chart + AI tips
2. Calendar – click a day to see event spending prediction
3. AI Insights – generate an analysis of your spending patterns
4. Challenges – gamified financial goals to level up
5. Chat – ask the AI assistant for advice

## Configuration

Add a Gemini key to `.env`:
```
GEMINI_API_KEY=your-key
```

That’s it! Feel free to reach out if you have any other questions.