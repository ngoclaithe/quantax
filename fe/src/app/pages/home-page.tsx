import React from 'react';
import { TrendingUp, Users, Copy, Trophy, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { QuickStartGuide } from '@/app/components/quick-start-guide';
import { StatsTicker } from '@/app/components/stats-ticker';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useWalletStore } from '@/stores/wallet-store';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isConnected, connectWallet } = useWalletStore();

  const stats = [
    { label: 'Khối lượng 24h', value: formatCurrency(15420350.75), icon: TrendingUp, color: 'from-indigo-500 to-purple-600' },
    { label: 'Tổng lệnh', value: formatNumber(45678, 0), icon: Copy, color: 'from-cyan-500 to-blue-600' },
    { label: 'Trader hoạt động', value: formatNumber(3456, 0), icon: Users, color: 'from-emerald-500 to-teal-600' },
    { label: 'Tỷ lệ thanh toán', value: '85%', icon: Trophy, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="relative">
      <StatsTicker />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full blur-3xl" />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nền tảng giao dịch thế hệ mới</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Quantax</span>
            <br />
            <span className="text-foreground">Binary Trading</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Nền tảng giao dịch Binary Option phi tập trung với thanh toán on-chain,
            minh bạch và an toàn tuyệt đối
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            {!isConnected ? (
              <Button size="lg" onClick={connectWallet} className="gap-2 px-8">
                Kết nối ví để bắt đầu
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button size="lg" onClick={() => onNavigate('trading')} className="gap-2 px-8">
                Bắt đầu giao dịch
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => onNavigate('copy-trade')} className="gap-2 px-8">
              <Copy className="h-5 w-5" />
              Copy Trade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="hover-lift group">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-emerald-600/20 w-fit mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Giao dịch nhanh chóng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Đặt lệnh chỉ trong vài giây với các khung thời gian linh hoạt từ 1 phút đến 15 phút
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift group">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-info/20 to-blue-600/20 w-fit mb-3 group-hover:scale-110 transition-transform">
                <Copy className="h-6 w-6 text-info" />
              </div>
              <CardTitle>Copy Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Theo dõi và sao chép giao dịch từ các trader hàng đầu với tỷ lệ thắng cao
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift group">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-orange-600/20 w-fit mb-3 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>An toàn & Minh bạch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Thanh toán on-chain, dữ liệu giá từ Oracle đáng tin cậy, không thể gian lận
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            <span className="gradient-text">Bắt đầu nhanh chóng</span>
          </h2>
          <QuickStartGuide />
        </div>

        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl text-center">Binary Option hoạt động như thế nào?</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Chọn tài sản & thời gian', desc: 'Chọn cặp giao dịch và khung thời gian bạn muốn' },
                { step: 2, title: 'Dự đoán TĂNG hoặc GIẢM', desc: 'Chọn hướng giá bạn nghĩ sẽ di chuyển' },
                { step: 3, title: 'Nhận kết quả', desc: 'Nếu đúng, nhận 85% lợi nhuận ngay lập tức' },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>Phi tập trung</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>An toàn</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>Nhanh chóng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
