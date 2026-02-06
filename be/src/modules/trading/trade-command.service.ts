import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TradeCreatedEvent } from '../../events/trade.events';
import { WalletService } from '../wallet/wallet.service';
import { OracleService } from '../oracle/oracle.service';

@Injectable()
export class TradeCommandService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
        private walletService: WalletService,
        private oracleService: OracleService,
    ) { }

    async createOrder(
        userId: string,
        pairId: string,
        direction: 'UP' | 'DOWN',
        amount: number,
        timeframeSec: number,
    ) {
        // Find by ID because payload sends pairId (UUID)
        const pair = await this.prisma.tradingPair.findUnique({ where: { id: pairId } });
        if (!pair || !pair.isActive) {
            throw new Error('Invalid pair or pair not found: ' + pairId);
        }

        // Get current price for Entry Price
        const entryPrice = await this.oracleService.getPrice(pair.symbol);
        if (!entryPrice) {
            throw new Error('Price not available for: ' + pair.symbol);
        }

        await this.walletService.lockBalance(userId, amount);

        const expireTime = new Date(Date.now() + timeframeSec * 1000);

        const trade = await this.prisma.tradeOrder.create({
            data: {
                userId,
                pairId: pair.id,
                direction,
                amount,
                payoutRate: pair.payoutRate,
                expireTime,
                entryPrice, // Set entry price
                status: 'LOCKED',
            },
        });

        this.eventEmitter.emit(
            'trade.created',
            new TradeCreatedEvent(trade.id, userId, pair.id, direction, amount),
        );

        return trade;
    }

    async getMyTrades(userId: string, status?: string) {
        return this.prisma.tradeOrder.findMany({
            where: {
                userId,
                ...(status ? { status: status as any } : {}),
            },
            include: { pair: true, result: true },
            orderBy: { openTime: 'desc' },
            take: 10, // Limit 10 trades
        });
    }

    async getTradeById(tradeId: string) {
        return this.prisma.tradeOrder.findUnique({
            where: { id: tradeId },
            include: { pair: true, result: true },
        });
    }
}
