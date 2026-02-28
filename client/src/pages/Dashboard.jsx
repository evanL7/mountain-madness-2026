import { useApi } from '../hooks/useApi';
import { api } from '../api/client';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import WeeklySpendingChart from '../components/dashboard/WeeklySpendingChart';
import SavingsGoals from '../components/dashboard/SavingsGoals';
import QuickTips from '../components/dashboard/QuickTips';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import SpendingByCalendar from '../components/dashboard/SpendingByCalendar';
import Skeleton from '../components/common/Skeleton';

export default function Dashboard() {
  const { data: summary, loading: summaryLoading } = useApi(api.dashboard.getSummary, []);
  const { data: tips, loading: tipsLoading } = useApi(api.dashboard.getTips, []);

  if (summaryLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton lines={2} />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton lines={8} />
          <Skeleton lines={8} />
        </div>
      </div>
    );
  }

  const { user, weekEvents } = summary || {};

  return (
    <div className="p-6 space-y-6">
      <WelcomeHeader user={user} weekEvents={weekEvents} />

      <WeeklySpendingChart weekEvents={weekEvents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SavingsGoals goals={user?.savingsGoals} />
          <QuickTips tips={tips} loading={tipsLoading} />
        </div>
        <div className="space-y-6">
          <UpcomingEvents events={weekEvents} />
          <SpendingByCalendar weekEvents={weekEvents} />
        </div>
      </div>
    </div>
  );
}
