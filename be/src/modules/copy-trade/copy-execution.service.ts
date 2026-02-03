import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TradeCreatedEvent } from '../../events/trade.events';
import { TradeCommandService } from '../trading/trade-command.service';

@Injectable()
export class CopyExecutionService {
    constructor(
        private prisma: PrismaService,
        private tradeCommandService: TradeCommandService,
    ) { }

    @OnEvent('trade.created')
    async handleTradeCreated(event: TradeCreatedEvent) {
        const followers = await this.prisma.copyFollower.findMany({
            where: { traderId: event.userId, isActive: true },
        });

        for (const follower of followers) {
            let copyAmount: number;

            if (follower.copyType === 'FIXED') {
                copyAmount = Number(follower.copyValue);
            } else {
                copyAmount = (event.amount * Number(follower.copyValue)) / 100;
            }

            copyAmount = Math.min(copyAmount, Number(follower.maxAmount));

            try {
                const copiedTrade = await this.tradeCommandService.createOrder(
                    follower.followerId,
                    event.pairId,
                    event.direction,
                    copyAmount,
                    60,
                );

                await this.prisma.copyTradeOrder.create({
                    data: {
                        sourceTradeId: event.tradeId,
                        followerTradeId: copiedTrade.id,
                    },
                });
            } catch { }
        }
    }
}
