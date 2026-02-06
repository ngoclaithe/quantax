import React from 'react';
import { Save, Power, Database, RefreshCw, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const SystemSettingsPage: React.FC = () => {
    const [loading, setLoading] = React.useState(false);
    const [settings, setSettings] = React.useState({
        maintenanceMode: false,
        tradingPaused: false,
        tradingFee: 5,
        minWithdrawal: 10,
        networkName: 'Binance Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
    });

    const [oracleStatus] = React.useState([
        { name: 'BTC/USDT', price: 43250.50, lastUpdate: '2s ago', status: 'active', source: 'Chainlink' },
        { name: 'ETH/USDT', price: 2250.80, lastUpdate: '5s ago', status: 'active', source: 'Chainlink' },
        { name: 'BNB/USDT', price: 310.20, lastUpdate: '1s ago', status: 'active', source: 'Internal' },
    ]);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Đã lưu cài đặt hệ thống');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="gradient-text">Cài đặt Hệ thống</span>
                    </h1>
                    <p className="text-muted-foreground">Cấu hình các tham số toàn cục của sàn.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cấu hình chung</CardTitle>
                        <CardDescription>Thông số vận hành cơ bản</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <div className="font-medium flex items-center gap-2">
                                    <Power className="h-4 w-4" />
                                    Maintenance Mode
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Tạm dừng toàn bộ hệ thống để bảo trì
                                </div>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <div className="font-medium flex items-center gap-2">
                                    <Power className="h-4 w-4 text-red-500" />
                                    Pause Trading
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Chỉ tạm dừng hoạt động đặt lệnh mới
                                </div>
                            </div>
                            <Switch
                                checked={settings.tradingPaused}
                                onCheckedChange={(c) => setSettings({ ...settings, tradingPaused: c })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Trading Fee (%)</label>
                            <Input
                                type="number"
                                value={settings.tradingFee}
                                onChange={(e) => setSettings({ ...settings, tradingFee: Number(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min Withdrawal (USDT)</label>
                            <Input
                                type="number"
                                value={settings.minWithdrawal}
                                onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                            />
                        </div>

                        <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
                            <Save className="h-4 w-4" />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Network & Blockchain */}
                <Card>
                    <CardHeader>
                        <CardTitle>Blockchain & Network</CardTitle>
                        <CardDescription>Kết nối RPC và Smart Contracts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Network Name</label>
                            <Input
                                value={settings.networkName}
                                onChange={(e) => setSettings({ ...settings, networkName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">RPC URL</label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.rpcUrl}
                                    onChange={(e) => setSettings({ ...settings, rpcUrl: e.target.value })}
                                />
                                <Button variant="outline" size="icon" onClick={() => toast.success('Đã kiểm tra kết nối RPC')}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
                            <p>Contract Address: 0x123...abc</p>
                            <p>Settlement Contract: 0x456...def</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Oracle Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-indigo-500" />
                                Oracle Status
                            </CardTitle>
                            <CardDescription>Trạng thái cập nhật giá từ các nguồn</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-3 w-3" /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {oracleStatus.map((oracle) => (
                            <div key={oracle.name} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                <div className="flex items-center gap-4">
                                    <div className={`h-2 w-2 rounded-full ${oracle.status === 'active' ? 'bg-success' : 'bg-danger'}`} />
                                    <div>
                                        <div className="font-bold">{oracle.name}</div>
                                        <div className="text-xs text-muted-foreground">Source: {oracle.source}</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-mono font-medium">{formatCurrency(oracle.price)}</div>
                                    <div className="text-xs text-success flex items-center justify-end gap-1">
                                        <Activity className="h-3 w-3" />
                                        Updated {oracle.lastUpdate}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
