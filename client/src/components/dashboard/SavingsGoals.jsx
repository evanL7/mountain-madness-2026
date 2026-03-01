import { Shield, Plane, Laptop } from 'lucide-react';
import Card from '../common/Card';

const ICONS = { shield: Shield, plane: Plane, laptop: Laptop };

export default function SavingsGoals({ goals }) {
  if (!goals?.length) return null;

  return (
    <Card title="Savings Goals">
      <div className="space-y-4">
        {goals.map((goal) => {
          const Icon = ICONS[goal.icon] || Shield;
          const pct = Math.round((goal.current / goal.target) * 100);
          const remaining = goal.target - goal.current;

          return (
            <div key={goal.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rbc-blue-light flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-rbc-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {goal.name}
                  </span>
                  <span className="text-xs text-slate-500">{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rbc-navy to-rbc-blue rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-slate-400">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-rbc-blue font-medium">
                    ${remaining.toLocaleString()} to go
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
