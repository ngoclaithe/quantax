import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export const LogsAuditPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const logs = [
        { id: 1, action: 'UPDATE_SETTINGS', admin: 'admin@bo.com', ip: '192.168.1.1', time: '2024-02-02 10:30:00', details: 'Changed trading fee from 4% to 5%' },
        { id: 2, action: 'PAUSE_TRADING', admin: 'manager@bo.com', ip: '113.20.1.5', time: '2024-02-02 09:15:00', details: 'Emergency pause triggered' },
        { id: 3, action: 'LOGIN_SUCCESS', admin: 'admin@bo.com', ip: '192.168.1.1', time: '2024-02-02 08:00:00', details: '2FA verified' },
        { id: 4, action: 'UPDATE_PAIR', admin: 'admin@bo.com', ip: '192.168.1.1', time: '2024-02-01 15:45:00', details: 'Disabled BTC/USDT' },
        { id: 5, action: 'WITHDRAWAL_APPROVE', admin: 'finance@bo.com', ip: '10.0.0.5', time: '2024-02-01 14:20:00', details: 'Approved withdrawal #12345 (500 USDT)' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Logs & Audit</h1>
                    <p className="text-muted-foreground">
                        Lịch sử hoạt động và log hệ thống
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>System Logs</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-9 w-[200px] md:w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.action}</Badge>
                                    </TableCell>
                                    <TableCell>{log.admin}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{log.ip}</TableCell>
                                    <TableCell className="text-sm">{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
