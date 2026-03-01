import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Trophy,
  MessageCircle,
  Flame,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/insights', icon: Sparkles, label: 'AI Insights' },
  { to: '/challenges', icon: Trophy, label: 'Challenges' },
  { to: '/chat', icon: MessageCircle, label: 'AI Chat' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <NavLink to="/" className="flex items-center gap-2" aria-label="Home">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">FutureSpend</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">See Tomorrow, Save Today</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
              EL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Evan Law</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-amber-400">Lvl 7</span>
                <span className="mx-0.5">|</span>
                <Flame className="w-3 h-3 text-orange-400" />
                <span>12 day streak</span>
              </div>
            </div>
          </div>
          {/* XP Bar */}
          <div className="mt-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                style={{ width: '65%' }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">2,450 / 3,000 XP</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
