import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarFilters from '../components/calendar/CalendarFilters';
import DayDetail from '../components/calendar/DayDetail';
import Skeleton from '../components/common/Skeleton';

export default function Calendar() {
  const { data, loading } = useApi(api.calendar.getAll, []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({
    work: true,
    personal: true,
    social: true,
    health: true,
    family: true,
  });

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton lines={2} />
        <div className="mt-6">
          <Skeleton lines={12} />
        </div>
      </div>
    );
  }

  const events = data?.events || [];

  // Calculate week summary
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const filteredEvents = events.filter((e) => filters[e.calendarType] !== false);
  const weekEvents = filteredEvents.filter((e) => {
    const d = new Date(e.date);
    return d >= weekStart && d < weekEnd;
  });
  const weekTotal = weekEvents.reduce((s, e) => s + (e.spendingPrediction?.estimated || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
          <p className="text-sm text-slate-500">View your events and predicted spending</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
          <span className="text-xs text-slate-500">This week's predicted spend</span>
          <p className="text-lg font-bold text-slate-800">${weekTotal.toFixed(0)}</p>
        </div>
      </div>

      <div className="mb-4">
        <CalendarFilters filters={filters} onToggle={toggleFilter} />
      </div>

      <div className={`grid ${selectedDate ? 'grid-cols-[1fr,380px]' : 'grid-cols-1'} gap-0`}>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <CalendarGrid
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            filters={filters}
          />
        </div>
        {selectedDate && (
          <DayDetail
            date={selectedDate}
            events={filteredEvents}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
}
