import { X, DollarSign } from 'lucide-react';
import EventCard from './EventCard';

export default function DayDetail({ date, events, onClose }) {
  if (!date) return null;

  const dayEvents = events
    ?.filter((e) => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

  const totalSpend = dayEvents.reduce((s, e) => s + (e.spendingPrediction?.estimated || 0), 0);
  const dateObj = new Date(date + 'T12:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white border-l border-slate-200 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">{dateLabel}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{dayEvents.length} events</span>
          {totalSpend > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
              <DollarSign className="w-3.5 h-3.5" />
              {totalSpend.toFixed(0)} predicted
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {dayEvents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No events on this day</p>
        ) : (
          dayEvents.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
