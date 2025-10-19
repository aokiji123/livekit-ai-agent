import { Metadata } from 'next';
import { SessionHistoryDashboard } from '@/components/history/session-history-dashboard';

export const metadata: Metadata = {
  title: 'Session History',
  description: 'View your recent conversation sessions',
};

export default function HistoryPage() {
  return (
    <div className="container mx-auto max-w-5xl p-6">
      <SessionHistoryDashboard />
    </div>
  );
}
