import React from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { FeatureTour } from './components/feature-tour';

// User Pages
import { HomePage } from './pages/home-page';
import { TradingPage } from './pages/trading-page';
import { CopyTradePage } from './pages/copy-trade-page';
import { LeaderboardPage } from './pages/leaderboard-page';
import { PortfolioPage } from './pages/portfolio-page';
import { ProfilePage } from './pages/profile-page';
import { SettingsPage } from './pages/settings-page';

// Admin Pages
import { AdminLoginPage } from './pages/admin/login-page';
import { AdminLayout } from './pages/admin/admin-layout';
import { AdminDashboardPage } from './pages/admin/dashboard-page';
import { TradesMonitoringPage } from './pages/admin/trades-monitoring-page';
import { PairsConfigPage } from './pages/admin/pairs-config-page';
import { TradersPage } from './pages/admin/traders-page';
import { AnalyticsPage } from './pages/admin/analytics-page';
import { SystemSettingsPage } from './pages/admin/system-settings-page';
import { LogsAuditPage } from './pages/admin/logs-audit-page';
import { RiskManagementPage } from './pages/admin/risk-management-page';

import { useAdminStore } from '@/stores/admin-store';

export type AppPage =
  | 'home'
  | 'trading'
  | 'copy-trade'
  | 'leaderboard'
  | 'portfolio'
  | 'profile'
  | 'settings'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-trades'
  | 'admin-traders'
  | 'admin-pairs'
  | 'admin-risk'
  | 'admin-analytics'
  | 'admin-settings'
  | 'admin-logs';

function App() {
  const [currentPage, setCurrentPage] = React.useState<AppPage>('home');
  const { isAuthenticated } = useAdminStore();

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  const isAdminPage = currentPage.startsWith('admin');
  const isAdminLogin = currentPage === 'admin-login';

  // Admin Login Page
  if (isAdminLogin) {
    return (
      <>
        <AdminLoginPage onLoginSuccess={() => setCurrentPage('admin-dashboard')} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Admin Pages
  if (isAdminPage) {
    if (!isAuthenticated) {
      setCurrentPage('admin-login');
      return null;
    }

    return (
      <>
        <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'admin-dashboard' && <AdminDashboardPage />}
          {currentPage === 'admin-trades' && <TradesMonitoringPage />}
          {currentPage === 'admin-pairs' && <PairsConfigPage />}
          {currentPage === 'admin-traders' && <TradersPage />}
          {currentPage === 'admin-analytics' && <AnalyticsPage />}
          {currentPage === 'admin-risk' && <RiskManagementPage />}
          {currentPage === 'admin-settings' && <SystemSettingsPage />}
          {currentPage === 'admin-logs' && <LogsAuditPage />}
        </AdminLayout>
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // User Pages
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isAdmin={false}
      />

      <main>
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'trading' && <TradingPage />}
        {currentPage === 'copy-trade' && <CopyTradePage />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
        {currentPage === 'portfolio' && <PortfolioPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      <Footer />

      {/* Feature Tour */}
      <FeatureTour onNavigate={handleNavigate} />

      {/* Admin Access - Hidden Button */}
      <button
        onClick={() => setCurrentPage('admin-login')}
        className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity text-xs text-muted-foreground"
      >
        Admin
      </button>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
