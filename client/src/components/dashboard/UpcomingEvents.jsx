import { Clock, MapPin, DollarSign } from 'lucide-react';
import Card from '../common/Card';

const CAL_COLORS = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  social: 'bg-amber-500',
  health: 'bg-emerald-500',
  family: 'bg-red-500',
};

export default function UpcomingEvents({ events }) {
  if (!events?.length) return null;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 6);

  return (
    <Card title="Upcoming Events">
      <div className="space-y-2">
        {upcoming.map((event) => {
          const spend = event.spendingPrediction?.estimated || 0;
          const isHighRisk = spend > 50;
          return (
            <div
              key={event.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isHighRisk
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  CAL_COLORS[event.calendarType] || 'bg-slate-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {event.date.slice(5)} {event.startTime}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              {spend > 0 && (
                <span
                  className={`text-sm font-semibold flex-shrink-0 ${
                    isHighRisk ? 'text-amber-600' : 'text-slate-600'
                  }`}
                >
                  ${spend.toFixed(0)}
                </span>
              )}
              {spend === 0 && (
                <span className="text-xs text-emerald-500 font-medium flex-shrink-0">Free</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
