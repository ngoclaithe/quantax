import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class CopyTradeService {
    constructor(private prisma: PrismaService) { }

    async getTopTraders() {
        return this.prisma.copyTrader.findMany({
            where: { isEnabled: true },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        avatarUrl: true,
                        stats: true,
                    },
                },
            },
            orderBy: { riskScore: 'asc' },
            take: 20,
        });
    }

    async followTrader(
        followerId: string,
        traderId: string,
        copyType: 'FIXED' | 'PERCENT',
        copyValue: number,
        maxAmount: number,
    ) {
        return this.prisma.copyFollower.upsert({
            where: {
                followerId_traderId: { followerId, traderId },
            },
            update: { copyType, copyValue, maxAmount, isActive: true },
            create: {
                followerId,
                traderId,
                copyType,
                copyValue,
                maxAmount,
            },
        });
    }

    async unfollowTrader(followerId: string, traderId: string) {
        return this.prisma.copyFollower.update({
            where: {
                followerId_traderId: { followerId, traderId },
            },
            data: { isActive: false },
        });
    }

    async getFollowing(followerId: string) {
        return this.prisma.copyFollower.findMany({
            where: { followerId, isActive: true },
            include: {
                trader: {
                    select: { id: true, nickname: true, avatarUrl: true, stats: true },
                },
            },
        });
    }
}
