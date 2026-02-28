import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../common/Card';

const COLORS = {
  food: '#F59E0B',
  transport: '#3B82F6',
  entertainment: '#8B5CF6',
  health: '#10B981',
  shopping: '#EF4444',
  other: '#6B7280',
};

export default function WeeklySpendingChart({ weekEvents }) {
  if (!weekEvents?.length) return null;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Group events by day
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = weekEvents.filter((e) => e.date === dateStr);
    const total = dayEvents.reduce(
      (sum, e) => sum + (e.spendingPrediction?.estimated || 0),
      0
    );
    return {
      day: days[i],
      date: dateStr,
      total: Math.round(total),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    };
  });

  const weekTotal = dailyData.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card
      title="This Week's Predicted Spending"
      action={
        <span className="text-lg font-bold text-slate-800">
          ${weekTotal.toLocaleString()}
        </span>
      }
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94A3B8' }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, 'Predicted']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {dailyData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.isToday
                      ? '#0051A5'
                      : entry.isPast
                        ? '#CBD5E1'
                        : '#93C5FD'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
