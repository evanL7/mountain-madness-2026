import { GoogleGenAI } from '@google/genai';

let ai = null;
const MODEL = 'gemini-2.5-flash';

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'your_key_here') {
      throw new Error('GEMINI_API_KEY not configured. Get one at https://aistudio.google.com/apikey');
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

// --- In-memory cache (5 min TTL) ---
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// --- Rate limiter: max 10 RPM with queuing ---
const queue = [];
const timestamps = [];
const MAX_RPM = 10;
let processing = false;

function rateLimitedCall(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  while (queue.length > 0) {
    // Clean old timestamps (older than 60s)
    const now = Date.now();
    while (timestamps.length > 0 && now - timestamps[0] > 60000) {
      timestamps.shift();
    }

    if (timestamps.length >= MAX_RPM) {
      // Wait until the oldest request expires
      const waitMs = 60000 - (now - timestamps[0]) + 100;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const { fn, resolve, reject } = queue.shift();
    timestamps.push(Date.now());
    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      // Retry once on 429
      if (err?.status === 429 || err?.message?.includes('429')) {
        console.log('Rate limited, retrying in 5s...');
        await new Promise((r) => setTimeout(r, 5000));
        timestamps.push(Date.now());
        try {
          const result = await fn();
          resolve(result);
        } catch (retryErr) {
          reject(retryErr);
        }
      } else {
        reject(err);
      }
    }
  }

  processing = false;
}

// USE CASE 1: Single Event Spending Prediction
export async function predictEventSpending(event, userProfile, pastTransactions) {
  const cacheKey = `predict_${event.id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const relevantTxns = pastTransactions
    .filter((t) => t.calendarType === event.calendarType)
    .slice(-10);

  const result = await rateLimitedCall(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are a personal finance AI. Analyze this calendar event and predict spending.

USER CONTEXT:
- Monthly income: $${userProfile.monthlyIncome}
- Location: Vancouver, BC, Canada

CALENDAR EVENT:
- Title: "${event.title}"
- Type: ${event.calendarType}
- Date: ${event.date}
- Time: ${event.startTime} - ${event.endTime}
- Location: ${event.location}
- Description: ${event.description}

PAST SIMILAR TRANSACTIONS:
${JSON.stringify(relevantTxns, null, 2)}

Predict the spending for this event with a detailed breakdown. Be specific to Vancouver pricing.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            estimatedTotal: { type: 'number' },
            confidence: { type: 'number' },
            category: { type: 'string' },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item: { type: 'string' },
                  amount: { type: 'number' },
                  isOptional: { type: 'boolean' },
                },
                required: ['item', 'amount', 'isOptional'],
              },
            },
            savingTips: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tip: { type: 'string' },
                  potentialSaving: { type: 'number' },
                },
                required: ['tip', 'potentialSaving'],
              },
            },
            riskLevel: { type: 'string' },
            reasoning: { type: 'string' },
          },
          required: ['estimatedTotal', 'confidence', 'category', 'breakdown', 'savingTips', 'riskLevel', 'reasoning'],
        },
      },
    });
    return JSON.parse(response.text);
  });

  setCache(cacheKey, result);
  return result;
}

// USE CASE 2: Weekly Multi-Event Analysis
export async function analyzeWeekSpending(weekEvents, userProfile, pastTransactions, pastWeekSummary) {
  const cacheKey = 'week_analysis';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await rateLimitedCall(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are FutureSpend AI, a personal finance advisor. Analyze this upcoming week holistically.

USER PROFILE:
- Name: ${userProfile.name}
- Monthly Income: $${userProfile.monthlyIncome}
- Monthly Budget: ${JSON.stringify(userProfile.monthlyBudget)}

THIS WEEK'S CALENDAR EVENTS (across all calendars):
${JSON.stringify(weekEvents, null, 2)}

LAST WEEK'S SPENDING SUMMARY:
${JSON.stringify(pastWeekSummary, null, 2)}

RECENT TRANSACTIONS:
${JSON.stringify(pastTransactions.slice(-20), null, 2)}

Provide a comprehensive weekly financial analysis. Consider:
1. How events from different calendars interact (busy work week -> more takeout)
2. Weekend social events compounding with weekday spending
3. Patterns from past transactions
4. Which days are highest risk for overspending
5. Specific, actionable recommendations`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            totalPredictedSpending: { type: 'number' },
            comparisonToTypical: { type: 'string' },
            percentAboveOrBelow: { type: 'number' },
            dailyBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  predictedSpend: { type: 'number' },
                  riskLevel: { type: 'string' },
                  topExpense: { type: 'string' },
                },
              },
            },
            categoryBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  predicted: { type: 'number' },
                  budget: { type: 'number' },
                  status: { type: 'string' },
                },
              },
            },
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            topRecommendation: { type: 'string' },
            potentialSavings: { type: 'number' },
          },
        },
      },
    });
    return JSON.parse(response.text);
  });

  setCache(cacheKey, result);
  return result;
}

// USE CASE 3: Spending Pattern Recognition
export async function analyzeSpendingPatterns(allEvents, allTransactions, userProfile) {
  const cacheKey = 'spending_patterns';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await rateLimitedCall(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are an expert financial behavior analyst. Analyze spending patterns across calendar types.

FULL CALENDAR HISTORY:
${JSON.stringify(allEvents, null, 2)}

FULL TRANSACTION HISTORY:
${JSON.stringify(allTransactions, null, 2)}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Identify deep patterns:
1. Which calendar type drives the most spending?
2. Day-of-week spending patterns
3. Spending triggers (e.g., social events after stressful work days)
4. Correlations between event density and convenience spending
5. Recurring expenses that could be optimized
6. Behavioral patterns the user might not be aware of`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            calendarTypeAnalysis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  calendarType: { type: 'string' },
                  avgSpendPerEvent: { type: 'number' },
                  totalSpend: { type: 'number' },
                  eventCount: { type: 'number' },
                  topCategory: { type: 'string' },
                  insight: { type: 'string' },
                },
              },
            },
            spendingTriggers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  trigger: { type: 'string' },
                  frequency: { type: 'string' },
                  avgImpact: { type: 'number' },
                  suggestion: { type: 'string' },
                },
              },
            },
            weekdayPattern: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  avgSpend: { type: 'number' },
                  dominantCategory: { type: 'string' },
                },
              },
            },
            hiddenPatterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pattern: { type: 'string' },
                  evidence: { type: 'string' },
                  financialImpact: { type: 'string' },
                  recommendation: { type: 'string' },
                },
              },
            },
            overallHealthScore: { type: 'number' },
            topThreeActions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    });
    return JSON.parse(response.text);
  });

  setCache(cacheKey, result);
  return result;
}

// USE CASE 4: Challenge Suggestions
export async function suggestChallenges(userProfile, spendingPatterns, activeCalendarEvents) {
  const cacheKey = 'challenge_suggestions';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await rateLimitedCall(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `You are a gamification expert for a personal finance app. Based on this user's spending patterns and upcoming calendar, suggest personalized savings challenges.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

RECENT SPENDING PATTERNS:
${JSON.stringify(spendingPatterns, null, 2)}

UPCOMING EVENTS THIS WEEK:
${JSON.stringify(activeCalendarEvents, null, 2)}

Create 3 challenges that are:
1. Directly tied to the user's actual spending patterns
2. Achievable but motivating
3. Connected to upcoming calendar events
4. Clear about the potential savings amount`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            suggestedChallenges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'number' },
                  difficulty: { type: 'string' },
                  xpReward: { type: 'number' },
                  potentialSaving: { type: 'number' },
                  relatedPattern: { type: 'string' },
                },
              },
            },
          },
        },
      },
    });
    return JSON.parse(response.text);
  });

  setCache(cacheKey, result);
  return result;
}

// USE CASE 5: Conversational Chat
export function createChatSession(userProfile, calendarEvents, transactions) {
  const systemContext = `You are FutureSpend AI, a friendly and knowledgeable personal finance assistant. You have access to the user's calendar, spending history, and financial goals.

USER PROFILE:
Name: ${userProfile.name}
Monthly Income: $${userProfile.monthlyIncome}
Current Balance: $${userProfile.currentBalance}
Savings Goals: ${userProfile.savingsGoals.map((g) => `${g.name}: $${g.current}/$${g.target}`).join(', ')}
Current XP: ${userProfile.xp}, Level: ${userProfile.level}
Monthly Budget: ${JSON.stringify(userProfile.monthlyBudget)}

UPCOMING CALENDAR EVENTS:
${JSON.stringify(calendarEvents.slice(0, 15), null, 2)}

RECENT TRANSACTIONS:
${JSON.stringify(transactions.slice(-15), null, 2)}

Guidelines:
- Be conversational, encouraging, and specific
- Reference actual events and transactions by name
- Give concrete dollar amounts when discussing savings
- Suggest specific actions tied to their calendar
- Keep responses concise (2-3 paragraphs max)
- When discussing spending, frame it positively (what they CAN do)`;

  return getAI().chats.create({
    model: MODEL,
    config: {
      systemInstruction: systemContext,
    },
  });
}

// USE CASE 6: Dashboard Quick Tips
export async function getDashboardTips(userProfile, todayEvents, recentTransactions) {
  const cacheKey = 'dashboard_tips';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await rateLimitedCall(async () => {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: `Generate 3 quick, actionable financial tips for today based on the user's schedule and recent spending.

TODAY'S EVENTS: ${JSON.stringify(todayEvents)}
RECENT SPENDING: ${JSON.stringify(recentTransactions.slice(-5))}
SAVINGS GOALS: ${JSON.stringify(userProfile.savingsGoals)}
CURRENT STREAK: ${userProfile.streak} days

Each tip should be 1-2 sentences, specific to today, and include a dollar amount when possible.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            tips: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  icon: { type: 'string' },
                  text: { type: 'string' },
                  savingAmount: { type: 'number' },
                },
                required: ['icon', 'text'],
              },
            },
          },
        },
      },
    });
    return JSON.parse(response.text);
  });

  setCache(cacheKey, result);
  return result;
}
