import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';

const CAL_CONFIG = {
  work: { color: '#3B82F6', label: 'Work' },
  personal: { color: '#8B5CF6', label: 'Personal' },
  social: { color: '#F59E0B', label: 'Social' },
  health: { color: '#10B981', label: 'Health' },
  family: { color: '#EF4444', label: 'Family' },
};

export default function SpendingByCalendar({ weekEvents }) {
  if (!weekEvents?.length) return null;

  const byType = {};
  weekEvents.forEach((e) => {
    const type = e.calendarType;
    const spend = e.spendingPrediction?.estimated || 0;
    if (!byType[type]) byType[type] = 0;
    byType[type] += spend;
  });

  const data = Object.entries(byType)
    .map(([type, total]) => ({
      name: CAL_CONFIG[type]?.label || type,
      value: Math.round(total),
      color: CAL_CONFIG[type]?.color || '#6B7280',
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card title="Spending by Calendar">
      <div className="flex items-center gap-4">
        <div className="w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Predicted']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-slate-600">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">${d.value}</span>
                <span className="text-xs text-slate-400">
                  {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
