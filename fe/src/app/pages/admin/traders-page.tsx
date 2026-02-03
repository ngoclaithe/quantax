import React from 'react';
import { Users, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { formatAddress, formatPercent, formatCurrency } from '@/lib/utils';

export const TradersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const mockTraders = Array.from({ length: 30 }, (_, i) => ({
    id: `trader_${i}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    totalVolume: Math.floor(Math.random() * 100000) + 1000,
    totalTrades: Math.floor(Math.random() * 500) + 10,
    winRate: 50 + Math.random() * 35,
    pnl: (Math.random() - 0.3) * 50000,
    followers: Math.floor(Math.random() * 200),
    status: Math.random() > 0.9 ? 'suspicious' : 'normal',
  })).sort((a, b) => b.totalVolume - a.totalVolume);

  const filteredTraders = mockTraders.filter((trader) =>
    trader.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Traders</h1>
          <p className="text-muted-foreground">
            Giám sát và quản lý người dùng giao dịch
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc nâng cao
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Tổng traders</div>
            <div className="text-2xl font-bold">{mockTraders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Top Volume</div>
            <div className="text-xl font-bold">
              {formatCurrency(mockTraders[0]?.totalVolume || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Win Rate TB</div>
            <div className="text-xl font-bold text-success">
              {formatPercent(
                mockTraders.reduce((sum, t) => sum + t.winRate, 0) / mockTraders.length
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Copy Traders</div>
            <div className="text-xl font-bold">
              {mockTraders.filter((t) => t.followers > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Cảnh báo</div>
            <div className="text-xl font-bold text-warning">
              {mockTraders.filter((t) => t.status === 'suspicious').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách Traders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Hạng</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Địa chỉ</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Volume</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Lệnh</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Win Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">PnL</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Followers</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraders.slice(0, 20).map((trader, index) => (
                  <tr
                    key={trader.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground">#{index + 1}</td>
                    <td className="py-3 px-4 font-mono text-sm">{trader.address}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(trader.totalVolume)}
                    </td>
                    <td className="py-3 px-4 text-right">{trader.totalTrades}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={trader.winRate >= 60 ? 'success' : 'default'}>
                        {formatPercent(trader.winRate)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          trader.pnl >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {trader.pnl >= 0 ? '+' : ''}
                        {formatCurrency(trader.pnl)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {trader.followers > 0 ? (
                        <Badge variant="info">{trader.followers}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={trader.status === 'suspicious' ? 'warning' : 'success'}
                      >
                        {trader.status === 'suspicious' ? 'Cảnh báo' : 'Bình thường'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                        {trader.status === 'suspicious' && (
                          <Button size="sm" variant="outline" className="text-danger">
                            Tạm dừng
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
