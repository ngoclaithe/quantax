import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAdminStore } from '@/stores/admin-store';
import { toast } from 'sonner';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { login } = useAdminStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Đăng nhập thành công!');
        onLoginSuccess();
      } else {
        toast.error('Sai tên đăng nhập hoặc mật khẩu');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Đăng nhập để quản lý hệ thống
          </p>
        </CardHeader>
        <CardContent>
          {/* Security Warning */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-warning mb-1">Cảnh báo bảo mật</div>
              <div className="text-muted-foreground">
                Không chia sẻ thông tin đăng nhập với bất kỳ ai. Kích hoạt 2FA để bảo mật tốt hơn.
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Tên đăng nhập</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Mật khẩu</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Demo: admin / admin
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
