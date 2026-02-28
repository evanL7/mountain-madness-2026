import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { suggestChallenges } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(path.join(dataDir, file), 'utf-8'));
}

const router = Router();

router.get('/', (req, res) => {
  const community = loadJSON('community.json');
  res.json(community.challenges);
});

router.get('/leaderboard', (req, res) => {
  const community = loadJSON('community.json');
  res.json(community.leaderboard);
});

router.get('/suggest', async (req, res) => {
  try {
    const user = loadJSON('user.json');
    const calendars = loadJSON('calendars.json');
    const transactions = loadJSON('transactions.json');
    const upcomingEvents = calendars.events.filter((e) => new Date(e.date) >= new Date());
    const suggestions = await suggestChallenges(user, transactions.transactions, upcomingEvents);
    res.json(suggestions);
  } catch (error) {
    console.error('Challenge suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest challenges' });
  }
});

router.post('/:id/join', (req, res) => {
  res.json({ success: true, message: 'Joined challenge!', xpEarned: 10 });
});

export default router;
