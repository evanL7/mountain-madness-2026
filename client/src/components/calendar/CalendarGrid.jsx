import { useState, useMemo } from 'react';

const CAL_COLORS = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  social: 'bg-amber-500',
  health: 'bg-emerald-500',
  family: 'bg-red-500',
};

export default function CalendarGrid({ events, selectedDate, onSelectDate, filters }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const { days, startDay } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split('T')[0];
    });
    return { days, startDay };
  }, [currentMonth]);

  const filteredEvents = events?.filter((e) => filters[e.calendarType] !== false) || [];

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded">
          &larr; Prev
        </button>
        <h3 className="text-lg font-semibold text-slate-800">{monthLabel}</h3>
        <button onClick={nextMonth} className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded">
          Next &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-slate-50 py-2 text-center text-xs font-medium text-slate-500">
            {d}
          </div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />
        ))}
        {days.map((dateStr) => {
          const dayEvents = eventsByDate[dateStr] || [];
          const totalSpend = dayEvents.reduce((s, e) => s + (e.spendingPrediction?.estimated || 0), 0);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayNum = parseInt(dateStr.split('-')[2]);

          let bgClass = 'bg-white';
          if (totalSpend > 80) bgClass = 'bg-red-50';
          else if (totalSpend > 40) bgClass = 'bg-amber-50';

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`${bgClass} p-2 min-h-[80px] cursor-pointer hover:bg-blue-50 transition-colors ${
                isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm ${
                    isToday
                      ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  {dayNum}
                </span>
                {totalSpend > 0 && (
                  <span className={`text-[10px] font-medium ${totalSpend > 50 ? 'text-amber-600' : 'text-slate-400'}`}>
                    ${totalSpend.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {dayEvents.slice(0, 4).map((e) => (
                  <div
                    key={e.id}
                    className={`w-2 h-2 rounded-full ${CAL_COLORS[e.calendarType] || 'bg-slate-400'}`}
                    title={e.title}
                  />
                ))}
                {dayEvents.length > 4 && (
                  <span className="text-[9px] text-slate-400">+{dayEvents.length - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
