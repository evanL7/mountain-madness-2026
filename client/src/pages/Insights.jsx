import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { Sparkles, AlertTriangle, TrendingDown, Lightbulb, Eye } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area,
} from 'recharts';

const TRIGGER_ICONS = { warning: AlertTriangle, tip: Lightbulb, pattern: Eye };
const CAL_COLORS = {
  work: '#3B82F6', personal: '#8B5CF6', social: '#F59E0B', health: '#10B981', family: '#EF4444',
};

function HealthScore({ score }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <Card title="Financial Health Score" action={<span className="flex items-center gap-1 text-xs text-purple-500"><Sparkles className="w-3 h-3" />AI Powered</span>}>
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">
            {score >= 70 ? 'Great financial health!' : score >= 40 ? 'Room for improvement' : 'Needs attention'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Based on your spending patterns, savings rate, and budget adherence across all calendar types.</p>
        </div>
      </div>
    </Card>
  );
}

function CalendarTypeBreakdown({ data }) {
  if (!data?.length) return null;
  return (
    <Card title="Spending by Calendar Type">
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.calendarType} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 capitalize">{item.calendarType}</span>
              <span className="text-slate-500">${item.totalSpend?.toFixed(0) || 0} total | ${item.avgSpendPerEvent?.toFixed(0) || 0} avg/event</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                backgroundColor: CAL_COLORS[item.calendarType] || '#6B7280',
                width: `${Math.min((item.totalSpend / 400) * 100, 100)}%`,
              }} />
            </div>
            <p className="text-xs text-slate-400">{item.insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SpendingTriggers({ triggers }) {
  if (!triggers?.length) return null;
  return (
    <Card title="Spending Triggers">
      <div className="space-y-3">
        {triggers.map((t, i) => (
          <div key={i} className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">{t.trigger}</p>
              <p className="text-xs text-slate-500 mt-0.5">Frequency: {t.frequency} | Avg impact: ${t.avgImpact}</p>
              <p className="text-xs text-emerald-600 mt-1">{t.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WeekdayPattern({ data }) {
  if (!data?.length) return null;
  return (
    <Card title="Spending by Day of Week">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value) => [`$${value}`, 'Avg Spend']} />
            <Area type="monotone" dataKey="avgSpend" stroke="#8B5CF6" fill="#8B5CF640" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function HiddenPatterns({ patterns }) {
  if (!patterns?.length) return null;
  return (
    <Card title="Hidden Patterns" action={<span className="text-xs text-purple-500 flex items-center gap-1"><Eye className="w-3 h-3" />AI Discovered</span>}>
      <div className="space-y-3">
        {patterns.map((p, i) => (
          <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm font-medium text-purple-800">{p.pattern}</p>
            <p className="text-xs text-slate-600 mt-1">{p.evidence}</p>
            <p className="text-xs text-slate-500 mt-0.5">Impact: {p.financialImpact}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{p.recommendation}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionItems({ actions }) {
  if (!actions?.length) return null;
  return (
    <Card title="Top Actions to Take">
      <div className="space-y-2">
        {actions.map((action, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
            <p className="text-sm text-slate-700">{action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Insights() {
  const { data, loading, error } = useApi(api.insights.getPatterns, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">AI Insights</h2>
          <p className="text-sm text-slate-500">Powered by Google Gemini</p>
        </div>
        <div className="flex items-center gap-3 p-6 bg-purple-50 rounded-xl">
          <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full" />
          <p className="text-sm text-purple-700">FutureSpend AI is analyzing your patterns...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton lines={8} />
          <Skeleton lines={8} />
          <Skeleton lines={6} />
          <Skeleton lines={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">AI Insights</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
          Failed to load insights. Make sure your Gemini API key is configured in .env
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">AI Insights</h2>
        <p className="text-sm text-slate-500">Deep spending analysis powered by Google Gemini</p>
      </div>

      <HealthScore score={data?.overallHealthScore || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarTypeBreakdown data={data?.calendarTypeAnalysis} />
        <WeekdayPattern data={data?.weekdayPattern} />
        <SpendingTriggers triggers={data?.spendingTriggers} />
        <HiddenPatterns patterns={data?.hiddenPatterns} />
      </div>

      <ActionItems actions={data?.topThreeActions} />
    </div>
  );
}
