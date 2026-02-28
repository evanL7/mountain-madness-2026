import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { predictEventSpending } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(path.join(dataDir, file), 'utf-8'));
}

const router = Router();

router.get('/events', (req, res) => {
  res.json(loadJSON('calendars.json'));
});

router.get('/week/:startDate', (req, res) => {
  const calendars = loadJSON('calendars.json');
  const start = new Date(req.params.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const weekEvents = calendars.events.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d < end;
  });
  res.json(weekEvents);
});

router.post('/predict', async (req, res) => {
  try {
    const user = loadJSON('user.json');
    const transactions = loadJSON('transactions.json');
    const prediction = await predictEventSpending(req.body.event, user, transactions.transactions);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

export default router;
