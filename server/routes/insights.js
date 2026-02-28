import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { analyzeSpendingPatterns } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(path.join(dataDir, file), 'utf-8'));
}

const router = Router();

router.get('/patterns', async (req, res) => {
  try {
    const user = loadJSON('user.json');
    const calendars = loadJSON('calendars.json');
    const transactions = loadJSON('transactions.json');
    const patterns = await analyzeSpendingPatterns(calendars.events, transactions.transactions, user);
    res.json(patterns);
  } catch (error) {
    console.error('Patterns error:', error);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
});

export default router;
