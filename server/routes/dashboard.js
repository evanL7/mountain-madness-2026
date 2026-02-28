import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { analyzeWeekSpending, getDashboardTips } from '../services/gemini.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(file) {
  return JSON.parse(readFileSync(path.join(dataDir, file), 'utf-8'));
}

const router = Router();

router.get('/summary', (req, res) => {
  const user = loadJSON('user.json');
  const calendars = loadJSON('calendars.json');
  const transactions = loadJSON('transactions.json');

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekEvents = calendars.events.filter((e) => {
    const d = new Date(e.date);
    return d >= weekStart && d < weekEnd;
  });

  res.json({
    user,
    weekEvents,
    recentTransactions: transactions.transactions.slice(-10),
  });
});

router.get('/tips', async (req, res) => {
  try {
    const user = loadJSON('user.json');
    const calendars = loadJSON('calendars.json');
    const transactions = loadJSON('transactions.json');
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = calendars.events.filter((e) => e.date === today);
    const tips = await getDashboardTips(user, todayEvents, transactions.transactions);
    res.json(tips);
  } catch (error) {
    console.error('Tips error:', error);
    res.status(500).json({ error: 'Failed to generate tips' });
  }
});

router.get('/week-analysis', async (req, res) => {
  try {
    const user = loadJSON('user.json');
    const calendars = loadJSON('calendars.json');
    const transactions = loadJSON('transactions.json');

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekEvents = calendars.events.filter((e) => {
      const d = new Date(e.date);
      return d >= weekStart && d < weekEnd;
    });

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekTxns = transactions.transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= lastWeekStart && d < weekStart;
    });

    const pastWeekSummary = {
      total: lastWeekTxns.reduce((s, t) => s + t.amount, 0),
      transactions: lastWeekTxns,
    };

    const analysis = await analyzeWeekSpending(weekEvents, user, transactions.transactions, pastWeekSummary);
    res.json(analysis);
  } catch (error) {
    console.error('Week analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze week' });
  }
});

export default router;
