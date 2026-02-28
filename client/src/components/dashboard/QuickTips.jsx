import { Lightbulb, PiggyBank, Calendar, TrendingDown, Target, Zap, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

const ICONS = {
  lightbulb: Lightbulb,
  'piggy-bank': PiggyBank,
  calendar: Calendar,
  'trending-down': TrendingDown,
  target: Target,
  zap: Zap,
};

export default function QuickTips({ tips, loading }) {
  return (
    <Card
      title="AI Tips for Today"
      action={
        <span className="flex items-center gap-1 text-xs text-purple-500">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini
        </span>
      }
    >
      {loading ? (
        <Skeleton lines={4} />
      ) : tips?.tips?.length ? (
        <div className="space-y-3">
          {tips.tips.map((tip, i) => {
            const Icon = ICONS[tip.icon] || Lightbulb;
            return (
              <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{tip.text}</p>
                  {tip.savingAmount > 0 && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Save up to ${tip.savingAmount}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No tips available right now.</p>
      )}
    </Card>
  );
}
