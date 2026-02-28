const BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  dashboard: {
    getSummary: () => fetchJSON('/dashboard/summary'),
    getTips: () => fetchJSON('/dashboard/tips'),
    getWeekAnalysis: () => fetchJSON('/dashboard/week-analysis'),
  },
  calendar: {
    getAll: () => fetchJSON('/calendar/events'),
    getWeek: (startDate) => fetchJSON(`/calendar/week/${startDate}`),
    predictEvent: (event) =>
      fetchJSON('/calendar/predict', {
        method: 'POST',
        body: JSON.stringify({ event }),
      }),
  },
  insights: {
    getPatterns: () => fetchJSON('/insights/patterns'),
  },
  challenges: {
    getAll: () => fetchJSON('/challenges'),
    getLeaderboard: () => fetchJSON('/challenges/leaderboard'),
    getSuggestions: () => fetchJSON('/challenges/suggest'),
    join: (id) => fetchJSON(`/challenges/${id}/join`, { method: 'POST' }),
  },
  chat: {
    send: (message) =>
      fetchJSON('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    reset: () => fetchJSON('/chat/reset', { method: 'POST' }),
  },
};
