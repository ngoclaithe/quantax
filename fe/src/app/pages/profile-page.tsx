import React from 'react';
import { User, Share2, Copy as CopyIcon, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useWalletStore } from '@/stores/wallet-store';
import { useTradingStore } from '@/stores/trading-store';
import { formatAddress, formatPercent, formatCurrency } from '@/lib/utils';
import * as Switch from '@radix-ui/react-switch';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { address, balance } = useWalletStore();
  const { closedOrders } = useTradingStore();
  const [allowCopy, setAllowCopy] = React.useState(true);
  const [bio, setBio] = React.useState('Professional binary options trader');
  const [copied, setCopied] = React.useState(false);

  const totalTrades = closedOrders.length;
  const winTrades = closedOrders.filter(o => o.result === 'win').length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  
  const totalProfit = closedOrders
    .filter(o => o.result === 'win')
    .reduce((sum, o) => sum + o.amount * o.payout, 0);
  const totalLoss = closedOrders
    .filter(o => o.result === 'lose')
    .reduce((sum, o) => sum + o.amount, 0);
  const netPnl = totalProfit - totalLoss;
  const roi = totalLoss > 0 ? (netPnl / totalLoss) * 100 : 0;

  const profileUrl = `https://binarydex.io/trader/${address}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Đã copy link profile!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBio = () => {
    toast.success('Đã lưu thông tin!');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin và cài đặt của bạn
        </p>
      </div>

      {/* Public Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hồ sơ công khai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Info */}
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white text-3xl font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Trader {address?.slice(2, 6)}</h2>
                {winRate >= 70 && (
                  <Badge variant="success">
                    <Check className="h-3 w-3 mr-1" />
                    Top Trader
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {formatAddress(address || '')}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Tổng lệnh</div>
                  <div className="font-bold">{totalTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="font-bold text-success">{formatPercent(winRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div className="font-bold text-success">+{formatPercent(roi)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">PnL</div>
                  <div className={`font-bold ${netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                    {netPnl >= 0 ? '+' : ''}{formatCurrency(netPnl)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-2 font-semibold">Tiểu sử</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Giới thiệu về bản thân..."
              className="mb-2"
            />
            <Button size="sm" onClick={handleSaveBio}>
              Lưu thay đổi
            </Button>
          </div>

          {/* Share Profile */}
          <div className="border-t border-border pt-6">
            <label className="block text-sm mb-2 font-semibold">Chia sẻ profile</label>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Trade Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cài đặt Copy Trade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Cho phép người khác copy</div>
              <div className="text-sm text-muted-foreground">
                Người dùng khác có thể sao chép giao dịch của bạn
              </div>
            </div>
            <Switch.Root
              checked={allowCopy}
              onCheckedChange={setAllowCopy}
              className="w-11 h-6 bg-muted rounded-full relative data-[state=checked]:bg-primary transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
            </Switch.Root>
          </div>

          {allowCopy && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Followers hiện tại</span>
                <span className="font-semibold">
                  {Math.floor(Math.random() * 100 + 50)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Copy volume (30 ngày)</span>
                <span className="font-semibold">
                  {formatCurrency(Math.random() * 10000 + 5000)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-semibold">Địa chỉ ví</div>
              <div className="text-sm text-muted-foreground">{formatAddress(address || '')}</div>
            </div>
            <Badge>Đã kết nối</Badge>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-semibold">Network</div>
              <div className="text-sm text-muted-foreground">BSC Mainnet</div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold">Số dư</div>
              <div className="text-sm text-muted-foreground">Tổng tài sản khả dụng</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatCurrency(balance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
