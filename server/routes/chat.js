import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createChatSession } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(path.join(dataDir, file), 'utf-8'));
}

const router = Router();

let chatSession = null;

router.post('/message', async (req, res) => {
  try {
    if (!chatSession) {
      const user = loadJSON('user.json');
      const calendars = loadJSON('calendars.json');
      const transactions = loadJSON('transactions.json');
      chatSession = createChatSession(user, calendars.events, transactions.transactions);
    }
    const response = await chatSession.sendMessage({ message: req.body.message });
    res.json({ response: response.text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

router.post('/reset', (req, res) => {
  chatSession = null;
  res.json({ success: true });
});

export default router;
