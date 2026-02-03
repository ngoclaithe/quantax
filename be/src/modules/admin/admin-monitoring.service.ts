import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ExposureService } from '../risk/exposure.service';

@Injectable()
export class AdminMonitoringService {
    constructor(
        private prisma: PrismaService,
        private exposureService: ExposureService,
    ) { }

    async getDashboard() {
        const [totalUsers, totalTrades, exposure, recentTrades] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.tradeOrder.count(),
            this.exposureService.getTotalExposure(),
            this.prisma.tradeOrder.findMany({
                take: 10,
                orderBy: { openTime: 'desc' },
                include: { user: { select: { nickname: true, walletAddress: true } }, pair: true },
            }),
        ]);

        return { totalUsers, totalTrades, exposure, recentTrades };
    }

    async getTrades(status?: string) {
        return this.prisma.tradeOrder.findMany({
            where: status ? { status: status as any } : undefined,
            include: { user: { select: { nickname: true } }, pair: true, result: true },
            orderBy: { openTime: 'desc' },
            take: 100,
        });
    }
}
