
import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<'7d' | '30d' | '90d'>('30d');

  // Mock data
  const userGrowthData = Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/2`,
    newUsers: Math.floor(Math.random() * 50 + 20),
    activeUsers: Math.floor(Math.random() * 200 + 100),
  }));

  const tradingVolumeData = Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/2`,
    volume: Math.floor(Math.random() * 500000 + 200000),
    trades: Math.floor(Math.random() * 2000 + 500),
  }));

  const pairDistribution = [
    { pair: 'BTC/USDT', volume: 5500000, trades: 12500 },
    { pair: 'ETH/USDT', volume: 3200000, trades: 8200 },
    { pair: 'BNB/USDT', volume: 2100000, trades: 5400 },
    { pair: 'SOL/USDT', volume: 1800000, trades: 4100 },
    { pair: 'ARB/USDT', volume: 1400000, trades: 3200 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Analytics & Reports</span>
          </h1>
          <p className="text-muted-foreground">Báo cáo chi tiết hoạt động hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Chọn khoảng thời gian
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {[
          { value: '7d', label: '7 ngày' },
          { value: '30d', label: '30 ngày' },
          { value: '90d', label: '90 ngày' },
        ].map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${timeframe === tf.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Tổng người dùng</div>
            <div className="text-2xl font-bold">{formatNumber(3456, 0)}</div>
            <div className="text-xs text-success mt-1">+15.3% tháng này</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Tổng giao dịch</div>
            <div className="text-2xl font-bold">{formatNumber(45678, 0)}</div>
            <div className="text-xs text-success mt-1">+8.7% tháng này</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Volume TB/ngày</div>
            <div className="text-2xl font-bold">{formatCurrency(512350)}</div>
            <div className="text-xs text-success mt-1">+12.1% tháng này</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Copy Trade Volume</div>
            <div className="text-2xl font-bold">{formatCurrency(1250000)}</div>
            <div className="text-xs text-muted-foreground mt-1">24.3% tổng volume</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Người dùng mới"
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Người dùng hoạt động"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trading Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Khối lượng giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradingVolumeData}>
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pair Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bổ theo cặp giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Cặp</th>
                  <th className="text-right py-3 px-4">Volume</th>
                  <th className="text-right py-3 px-4">Số lệnh</th>
                  <th className="text-right py-3 px-4">Avg/lệnh</th>
                  <th className="text-right py-3 px-4">% Volume</th>
                </tr>
              </thead>
              <tbody>
                {pairDistribution.map((item) => {
                  const totalVolume = pairDistribution.reduce((sum, p) => sum + p.volume, 0);
                  const percent = (item.volume / totalVolume) * 100;
                  const avgPerTrade = item.volume / item.trades;

                  return (
                    <tr
                      key={item.pair}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold">{item.pair}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(item.volume)}
                      </td>
                      <td className="py-3 px-4 text-right">{formatNumber(item.trades, 0)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(avgPerTrade)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-sm">{percent.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trading Behavior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeframe phổ biến</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tf: '1 phút', percent: 45 },
              { tf: '3 phút', percent: 28 },
              { tf: '5 phút', percent: 18 },
              { tf: '10 phút', percent: 7 },
              { tf: '15 phút', percent: 2 },
            ].map((item) => (
              <div key={item.tf}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.tf}</span>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Khoảng tiền đặt cược</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { range: '$1 - $10', percent: 35 },
              { range: '$10 - $50', percent: 40 },
              { range: '$50 - $100', percent: 15 },
              { range: '$100 - $500', percent: 8 },
              { range: '$500+', percent: 2 },
            ].map((item) => (
              <div key={item.range}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.range}</span>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-info"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giờ giao dịch cao điểm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: '08:00 - 12:00', percent: 25 },
              { time: '12:00 - 16:00', percent: 35 },
              { time: '16:00 - 20:00', percent: 30 },
              { time: '20:00 - 00:00', percent: 8 },
              { time: '00:00 - 08:00', percent: 2 },
            ].map((item) => (
              <div key={item.time}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.time}</span>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
