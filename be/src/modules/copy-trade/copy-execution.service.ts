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
        // Find active followers of this trader
        const followers = await this.prisma.copyFollower.findMany({
            where: { traderId: event.userId, isActive: true },
        });

        if (followers.length === 0) return;

        console.log(`[CopyTrade] Found ${followers.length} followers for trader ${event.userId}`);

        for (const follower of followers) {
            let copyAmount: number;

            // Simple logic: 
            // FIXED = exact amount
            // PERCENT = percentage of the MASTER'S trade amount (e.g. copyValue=100 => same amount)
            // Note: sophisticated logic might use % of follower's balance, but let's stick to this for now
            if (follower.copyType === 'FIXED') {
                copyAmount = Number(follower.copyValue);
            } else {
                copyAmount = (event.amount * Number(follower.copyValue)) / 100;
            }

            // Cap at user's max per trade setting
            copyAmount = Math.min(copyAmount, Number(follower.maxAmount));

            // Skip if amount too small
            if (copyAmount <= 0) continue;

            try {
                const copiedTrade = await this.tradeCommandService.createOrder(
                    follower.followerId,
                    event.pairId,
                    event.direction,
                    copyAmount,
                    event.timeframe, // Use same timeframe
                );

                await this.prisma.copyTradeOrder.create({
                    data: {
                        sourceTradeId: event.tradeId,
                        followerTradeId: copiedTrade.id,
                    },
                });

                console.log(`[CopyTrade] Copied trade for ${follower.followerId}: ${copyAmount} on ${event.pairId}`);
            } catch (error) {
                console.error(`[CopyTrade] Failed to copy trade for ${follower.followerId}:`, error.message);
            }
        }
    }
}
