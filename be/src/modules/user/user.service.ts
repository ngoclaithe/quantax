import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    private async getUserStats(userId: string) {
        const trades = await this.prisma.tradeOrder.findMany({
            where: { userId, status: 'SETTLED' },
            include: { result: true }
        });

        const totalTrades = trades.length;
        const winTrades = trades.filter(t => t.result?.result === 'WIN').length;
        const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

        return {
            totalTrades,
            winRate
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { stats: true, wallet: true },
        });

        if (!user) return null;

        const liveStats = await this.getUserStats(user.id);
        return {
            ...user,
            liveStats
        };
    }

    async findByNickname(nickname: string) {
        const user = await this.prisma.user.findFirst({
            where: { nickname, isPublic: true },
            select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                bio: true,
            } as any,
        });

        if (!user) return null;

        const liveStats = await this.getUserStats((user as any).id);
        return {
            ...user,
            stats: {
                totalTrades: liveStats.totalTrades,
                winRate: liveStats.winRate
            }
        };
    }

    async getPublicProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isPublic: true },
            select: {
                id: true,
                nickname: true,
                avatarUrl: true,
                bio: true,
            } as any,
        });

        if (!user) return null;

        const liveStats = await this.getUserStats((user as any).id);
        return {
            ...user,
            stats: {
                totalTrades: liveStats.totalTrades,
                winRate: liveStats.winRate
            }
        };
    }

    async updateProfile(userId: string, data: { nickname?: string; avatarUrl?: string; isPublic?: boolean; bio?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async changePassword(userId: string, oldPass: string, newPass: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Không tìm thấy tài khoản hoặc tài khoản không dùng mật khẩu');
        }

        const isValid = await bcrypt.compare(oldPass, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Mật khẩu cũ không chính xác');
        }

        const passwordHash = await bcrypt.hash(newPass, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
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
                nickname: user.nickname || `Trader${index + 1}`,
                avatarUrl: user.avatarUrl,
                winRate: user.stats?.winRate ? Number(user.stats.winRate) : 0,
                roi: user.stats?.totalPnl ? Number(user.stats.totalPnl) / 10 : 0,
                pnl: user.stats?.totalPnl ? Number(user.stats.totalPnl) : 0,
                totalTrades: user.stats?.totalTrades || 0,
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }
}
