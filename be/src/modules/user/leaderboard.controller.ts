import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Controller('leaderboard')
export class LeaderboardController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getLeaderboard(@Query('timeframe') timeframe: string = 'week') {
        // Logic tính toán leaderboard
        // Hiện tại lấy top users có PnL cao nhất từ bảng UserStats
        // Thực tế cần tính theo timeframe (cần query bảng TradeOrderResult có filter date)

        let dateFilter = new Date();
        if (timeframe === 'day') dateFilter.setDate(dateFilter.getDate() - 1);
        else if (timeframe === 'week') dateFilter.setDate(dateFilter.getDate() - 7);
        else if (timeframe === 'year') dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        else dateFilter.setMonth(dateFilter.getMonth() - 1); // default month

        // Query đơn giản từ UserStats (lưu ý: UserStats là all-time, cần update schema nếu muốn stats theo time)
        // Để demo, ta lấy UserStats hiện tại

        const topTraders = await this.prisma.userStats.findMany({
            orderBy: { totalPnl: 'desc' },
            take: 20,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        walletAddress: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return topTraders.map((stat, index) => ({
            rank: index + 1,
            id: stat.user.id,
            walletAddress: stat.user.walletAddress,
            nickname: stat.user.nickname || `Trader ${index + 1}`,
            avatarUrl: stat.user.avatarUrl,
            winRate: Number(stat.winRate),
            pnl: Number(stat.totalPnl),
            totalTrades: stat.totalTrades,
            roi: stat.totalPnl.toNumber() > 0 ? 100 : 0, // Mock ROI for now
        }));
    }
}
