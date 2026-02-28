const CAL_TYPES = [
  { id: 'work', name: 'Work', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
  { id: 'personal', name: 'Personal', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-100' },
  { id: 'social', name: 'Social', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-100' },
  { id: 'health', name: 'Health', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-100' },
  { id: 'family', name: 'Family', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
];

export default function CalendarFilters({ filters, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CAL_TYPES.map((cal) => {
        const active = filters[cal.id] !== false;
        return (
          <button
            key={cal.id}
            onClick={() => onToggle(cal.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              active
                ? `${cal.bgLight} ${cal.textColor}`
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${active ? cal.color : 'bg-slate-300'}`} />
            {cal.name}
          </button>
        );
      })}
    </div>
  );
}
