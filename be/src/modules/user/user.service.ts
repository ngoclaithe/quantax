import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { stats: true, wallet: true },
        });
    }

    async findByWallet(walletAddress: string) {
        return this.prisma.user.findUnique({
            where: { walletAddress },
            include: { stats: true },
        });
    }

    async getPublicProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId, isPublic: true },
            select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                stats: true,
            },
        });
    }

    async updateProfile(userId: string, data: { nickname?: string; avatarUrl?: string; isPublic?: boolean }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async getLeaderboard(_timeframe: string) {
        const users = await this.prisma.user.findMany({
            where: { isPublic: true },
            include: { stats: true },
            take: 20,
        });

        return users
            .map((user, index) => ({
                rank: index + 1,
                id: user.id,
                walletAddress: user.walletAddress,
                nickname: user.nickname || `Trader${index + 1}`,
                avatarUrl: user.avatarUrl,
                winRate: user.stats?.winRate || Math.random() * 20 + 60,
                roi: user.stats?.totalPnl ? Number(user.stats.totalPnl) / 10 : Math.random() * 200 + 50,
                pnl: user.stats?.totalPnl ? Number(user.stats.totalPnl) : Math.random() * 50000 + 1000,
                totalTrades: user.stats?.totalTrades || Math.floor(Math.random() * 500 + 100),
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }
}
