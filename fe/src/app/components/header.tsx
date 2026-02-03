import React from 'react';
import { Wallet, Menu } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import { Button } from './ui/button';
import { formatAddress, formatCurrency } from '@/lib/utils';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, isAdmin = false }) => {
  const { isConnected, address, balance, connectWallet, disconnectWallet, isLoading } =
    useWalletStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const userMenuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'trading', label: 'Giao dịch' },
    { id: 'copy-trade', label: 'Copy Trade' },
    { id: 'leaderboard', label: 'Bảng xếp hạng' },
    { id: 'portfolio', label: 'Danh mục' },
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'settings', label: 'Cài đặt' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <img
                src="/images/logo.png"
                alt="Quantax"
                className="h-10 w-10 rounded-xl object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-2xl font-bold gradient-text">Quantax</span>
          </div>

          {!isAdmin && (
            <nav className="hidden md:flex items-center gap-1">
              {userMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 ${currentPage === item.id
                      ? 'bg-primary/20 text-primary glow-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <>
                {isConnected ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right glass-card rounded-xl px-4 py-2">
                      <div className="text-sm font-semibold text-primary">
                        {formatCurrency(balance)}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatAddress(address!)}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectWallet}
                      className="gap-2 hover-glow"
                    >
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">Ngắt kết nối</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="gap-2 glow-primary animate-pulse-glow"
                  >
                    <Wallet className="h-4 w-4" />
                    {isLoading ? 'Đang kết nối...' : 'Kết nối ví'}
                  </Button>
                )}

                <button
                  className="md:hidden p-2 hover:bg-accent rounded-xl transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {!isAdmin && showMenu && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1">
              {userMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setShowMenu(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-left transition-all ${currentPage === item.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
