import React from 'react';
import { TrendingUp, TrendingDown, Activity, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useTradingStore } from '@/stores/trading-store';
import { useWalletStore } from '@/stores/wallet-store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const PortfolioPage: React.FC = () => {
  const { closedOrders, fetchMyTrades } = useTradingStore();
  const { balance, lockedBalance, fetchWallet, isConnected } = useWalletStore();

  React.useEffect(() => {
    if (isConnected) {
      fetchMyTrades();
      fetchWallet();
    }
  }, [isConnected, fetchMyTrades, fetchWallet]);

  const totalTrades = closedOrders.length;
  const winTrades = closedOrders.filter((o) => o.result?.result === 'WIN').length;
  const loseTrades = closedOrders.filter((o) => o.result?.result === 'LOSE').length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

  const totalProfit = closedOrders
    .filter((o) => o.result?.result === 'WIN')
    .reduce((sum, o) => sum + (o.result?.profit || 0), 0);
  const totalLoss = closedOrders
    .filter((o) => o.result?.result === 'LOSE')
    .reduce((sum, o) => sum + Number(o.amount), 0);
  const netPnl = totalProfit - totalLoss;
  const roi = totalLoss > 0 ? (netPnl / totalLoss) * 100 : 0;

  const pnlHistory = closedOrders
    .slice()
    .reverse()
    .reduce(
      (acc, order, i) => {
        const prevValue = i > 0 ? acc[i - 1].value : 0;
        const change =
          order.result?.result === 'WIN'
            ? order.result?.profit || 0
            : -Number(order.amount);
        acc.push({
          date: new Date(order.openTime).toLocaleDateString('vi-VN'),
          value: prevValue + change,
        });
        return acc;
      },
      [] as { date: string; value: number }[]
    );

  const tradesByPair = closedOrders.reduce(
    (acc, order) => {
      const pair = order.pair?.symbol || 'Unknown';
      acc[pair] = (acc[pair] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pairData = Object.entries(tradesByPair).map(([pair, count]) => ({
    name: pair,
    value: count,
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#22d3ee', '#10b981'];

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-20">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Kết nối ví để xem danh mục</h2>
          <p className="text-muted-foreground">
            Vui lòng kết nối ví để xem thống kê giao dịch của bạn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Danh mục đầu tư</h1>
        <p className="text-muted-foreground">Phân tích hiệu suất giao dịch của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Số dư khả dụng</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Đã khóa: {formatCurrency(lockedBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">PnL ròng</span>
              {netPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
            </div>
            <div className={`text-2xl font-bold ${netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
              {netPnl >= 0 ? '+' : ''}
              {formatCurrency(netPnl)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tỷ lệ thắng</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold">{formatPercent(winRate)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {winTrades}W / {loseTrades}L
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">ROI</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className={`text-2xl font-bold ${roi >= 0 ? 'text-success' : 'text-danger'}`}>
              {roi >= 0 ? '+' : ''}
              {formatPercent(roi)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ PnL</CardTitle>
          </CardHeader>
          <CardContent>
            {pnlHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={pnlHistory.slice(-30)}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(value) => value.split('/')[0]}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${formatCurrency(value)}`, 'PnL']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorPnl)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo cặp</CardTitle>
          </CardHeader>
          <CardContent>
            {pairData.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pairData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pairData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pairData.map((pair, i) => (
                    <div key={pair.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span>{pair.name}</span>
                      </div>
                      <span className="font-semibold">{pair.value} lệnh</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {closedOrders.length > 0 ? (
            <div className="space-y-3">
              {closedOrders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${order.result?.result === 'WIN' ? 'bg-success/20' : 'bg-danger/20'
                        }`}
                    >
                      {order.result?.result === 'WIN' ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{order.pair?.symbol || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.openTime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${order.result?.result === 'WIN' ? 'text-success' : 'text-danger'
                        }`}
                    >
                      {order.result?.result === 'WIN' ? '+' : '-'}
                      {formatCurrency(
                        order.result?.result === 'WIN'
                          ? order.result?.profit || 0
                          : Number(order.amount)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.result?.result === 'WIN' ? 'Thắng' : 'Thua'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Chưa có giao dịch nào</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
