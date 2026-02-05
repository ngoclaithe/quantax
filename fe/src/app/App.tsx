import React, { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { useAdminStore } from '@/stores/admin-store';

// Lazy load all pages for code splitting
const HomePage = lazy(() => import('./pages/home-page').then(m => ({ default: m.HomePage })));
const TradingPage = lazy(() => import('./pages/trading-page').then(m => ({ default: m.TradingPage })));
const CopyTradePage = lazy(() => import('./pages/copy-trade-page').then(m => ({ default: m.CopyTradePage })));
const LeaderboardPage = lazy(() => import('./pages/leaderboard-page').then(m => ({ default: m.LeaderboardPage })));
const PortfolioPage = lazy(() => import('./pages/portfolio-page').then(m => ({ default: m.PortfolioPage })));
const ProfilePage = lazy(() => import('./pages/profile-page').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/settings-page').then(m => ({ default: m.SettingsPage })));
const FeatureTour = lazy(() => import('./components/feature-tour').then(m => ({ default: m.FeatureTour })));

// Admin Pages - lazy loaded
const AdminLoginPage = lazy(() => import('./pages/admin/login-page').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/admin-layout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('./pages/admin/dashboard-page').then(m => ({ default: m.AdminDashboardPage })));
const TradesMonitoringPage = lazy(() => import('./pages/admin/trades-monitoring-page').then(m => ({ default: m.TradesMonitoringPage })));
const PairsConfigPage = lazy(() => import('./pages/admin/pairs-config-page').then(m => ({ default: m.PairsConfigPage })));
const TradersPage = lazy(() => import('./pages/admin/traders-page').then(m => ({ default: m.TradersPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/analytics-page').then(m => ({ default: m.AnalyticsPage })));
const SystemSettingsPage = lazy(() => import('./pages/admin/system-settings-page').then(m => ({ default: m.SystemSettingsPage })));
const LogsAuditPage = lazy(() => import('./pages/admin/logs-audit-page').then(m => ({ default: m.LogsAuditPage })));
const RiskManagementPage = lazy(() => import('./pages/admin/risk-management-page').then(m => ({ default: m.RiskManagementPage })));
const PriceManipulationPage = lazy(() => import('./pages/admin/price-manipulation-page').then(m => ({ default: m.PriceManipulationPage })));

// Secret admin route - only you know this
const ADMIN_SECRET_ROUTE = 'quantax-admin-2024';

// Loading spinner component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

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
  | 'admin-logs'
  | 'admin-prices';

function App() {
  const [currentPage, setCurrentPage] = React.useState<AppPage>('home');
  const { isAuthenticated } = useAdminStore();

  // Check URL hash for admin route on mount and hash change
  React.useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash === ADMIN_SECRET_ROUTE) {
        setCurrentPage('admin-login');
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
    // Clear hash when navigating away from admin
    if (!page.startsWith('admin')) {
      window.location.hash = '';
    }
  };

  const isAdminPage = currentPage.startsWith('admin');
  const isAdminLogin = currentPage === 'admin-login';

  // Admin Login Page
  if (isAdminLogin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage onLoginSuccess={() => setCurrentPage('admin-dashboard')} />
        <Toaster position="top-right" richColors duration={2000} />
      </Suspense>
    );
  }

  // Admin Pages
  if (isAdminPage) {
    if (!isAuthenticated) {
      setCurrentPage('admin-login');
      return null;
    }

    return (
      <Suspense fallback={<PageLoader />}>
        <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'admin-dashboard' && <AdminDashboardPage />}
          {currentPage === 'admin-trades' && <TradesMonitoringPage />}
          {currentPage === 'admin-pairs' && <PairsConfigPage />}
          {currentPage === 'admin-traders' && <TradersPage />}
          {currentPage === 'admin-analytics' && <AnalyticsPage />}
          {currentPage === 'admin-risk' && <RiskManagementPage />}
          {currentPage === 'admin-settings' && <SystemSettingsPage />}
          {currentPage === 'admin-logs' && <LogsAuditPage />}
          {currentPage === 'admin-prices' && <PriceManipulationPage />}
        </AdminLayout>
        <Toaster position="top-right" richColors duration={2000} />
      </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentPage === 'trading' && <TradingPage />}
          {currentPage === 'copy-trade' && <CopyTradePage />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
          {currentPage === 'portfolio' && <PortfolioPage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'settings' && <SettingsPage />}
        </Suspense>
      </main>

      <Footer />

      {/* Feature Tour - lazy loaded */}
      <Suspense fallback={null}>
        <FeatureTour onNavigate={handleNavigate} />
      </Suspense>

      <Toaster position="top-right" richColors duration={2000} />
    </div>
  );
}

export default App;
