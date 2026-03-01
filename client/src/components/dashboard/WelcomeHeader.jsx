import { Flame, Calendar, DollarSign, Star } from 'lucide-react';

export default function WelcomeHeader({ user, weekEvents }) {
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const todayStr = today.toISOString().split('T')[0];
  const todayEvents = weekEvents?.filter((e) => e.date === todayStr) || [];
  const todaySpend = todayEvents.reduce(
    (sum, e) => sum + (e.spendingPrediction?.estimated || 0),
    0
  );

  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-rbc-blue-light text-rbc-navy px-3 py-1.5 rounded-full text-sm font-medium">
          <Flame className="w-4 h-4 text-rbc-gold-dark" />
          {user?.streak || 0} day streak
        </div>
        <div className="flex items-center gap-1.5 bg-rbc-blue-light text-rbc-navy px-3 py-1.5 rounded-full text-sm font-medium">
          <Star className="w-4 h-4 text-rbc-gold-dark" />
          Level {user?.level || 0}
        </div>
        {todayEvents.length > 0 && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-1.5 rounded-full">
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              {todayEvents.length} events today
            </span>
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {todaySpend.toFixed(0)} predicted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
