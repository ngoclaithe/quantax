import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ExposureService {
    constructor(private prisma: PrismaService) { }

    async getExposureByPair() {
        const orders = await this.prisma.tradeOrder.groupBy({
            by: ['pairId', 'direction'],
            where: { status: 'LOCKED' },
            _sum: { amount: true },
        });

        return orders.map((o) => ({
            pairId: o.pairId,
            direction: o.direction,
            exposure: o._sum.amount,
        }));
    }

    async getTotalExposure() {
        const result = await this.prisma.tradeOrder.aggregate({
            where: { status: 'LOCKED' },
            _sum: { amount: true },
        });
        return result._sum.amount || 0;
    }
}
