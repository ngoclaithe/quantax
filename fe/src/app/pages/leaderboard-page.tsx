import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { formatPercent, formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';

interface LeaderboardTrader {
  rank: number;
  id: string;
  walletAddress: string;
  nickname: string;
  avatarUrl?: string;
  winRate: number;
  roi: number;
  pnl: number;
  totalTrades: number;
}

export const LeaderboardPage: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month'>('week');
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardTrader[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<LeaderboardTrader[]>(`/users/leaderboard?timeframe=${timeframe}`);
        setLeaderboard(data);
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
        setLeaderboard(
          Array.from({ length: 20 }, (_, i) => ({
            rank: i + 1,
            id: `mock-${i}`,
            walletAddress: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
            nickname: `Trader${i + 1}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=trader${i}`,
            winRate: 65 + Math.random() * 20,
            roi: 50 + Math.random() * 300,
            pnl: 1000 + Math.random() * 50000,
            totalTrades: Math.floor(100 + Math.random() * 900),
          })).sort((a, b) => b.pnl - a.pnl)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Bảng xếp hạng</span>
        </h1>
        <p className="text-muted-foreground">Top trader có hiệu suất cao nhất</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { value: 'day', label: '24 giờ' },
          { value: 'week', label: '7 ngày' },
          { value: 'month', label: '30 ngày' },
        ].map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value as 'day' | 'week' | 'month')}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${timeframe === tf.value
              ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaderboard.slice(0, 3).map((trader) => (
              <Card
                key={trader.id}
                className={`hover-lift ${trader.rank === 1 ? 'border-yellow-500/50 bg-yellow-500/5 glow-primary' : ''}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <img
                      src={trader.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.id}`}
                      alt={trader.nickname}
                      className="h-20 w-20 rounded-full border-4 border-border"
                    />
                    <div
                      className={`absolute -top-2 -right-2 h-10 w-10 rounded-full ${trader.rank === 1
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : trader.rank === 2
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                          : 'bg-gradient-to-br from-orange-400 to-orange-600'
                        } flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {trader.rank}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{trader.nickname}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {formatAddress(trader.walletAddress)}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-success">
                        +{formatCurrency(trader.pnl)}
                      </div>
                      <div className="text-xs text-muted-foreground">PnL</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="font-semibold">{formatPercent(trader.winRate)}</div>
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                      </div>
                      <div>
                        <div className="font-semibold">+{formatPercent(trader.roi)}</div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Toàn bộ xếp hạng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Hạng</th>
                      <th className="text-left py-3 px-4">Trader</th>
                      <th className="text-right py-3 px-4">Win Rate</th>
                      <th className="text-right py-3 px-4">ROI</th>
                      <th className="text-right py-3 px-4">PnL</th>
                      <th className="text-right py-3 px-4">Tổng lệnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((trader) => (
                      <tr
                        key={trader.id}
                        className="border-b border-border hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {trader.rank <= 3 ? (
                              <Medal className={`h-5 w-5 ${getMedalColor(trader.rank)}`} />
                            ) : (
                              <span className="w-5 text-center text-muted-foreground">
                                {trader.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={trader.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.id}`}
                              alt={trader.nickname}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <div className="font-semibold">{trader.nickname}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatAddress(trader.walletAddress)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={trader.winRate >= 70 ? 'success' : 'default'}>
                            {formatPercent(trader.winRate)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-success font-semibold">
                          +{formatPercent(trader.roi)}
                        </td>
                        <td className="py-3 px-4 text-right text-success font-semibold">
                          +{formatCurrency(trader.pnl)}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {trader.totalTrades}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
