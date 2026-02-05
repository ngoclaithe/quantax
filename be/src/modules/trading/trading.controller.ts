import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradeCommandService } from './trade-command.service';

@Controller('trades')
@UseGuards(AuthGuard('jwt'))
export class TradingController {
    constructor(private tradeCommandService: TradeCommandService) { }

    @Post()
    async createTrade(
        @Request() req: { user: { userId: string } },
        @Body() body: { pairId: string; direction: 'UP' | 'DOWN'; amount: number; timeframe: number },
    ) {
        return this.tradeCommandService.createOrder(
            req.user.userId,
            body.pairId,
            body.direction,
            body.amount,
            body.timeframe,
        );
    }

    @Get('my')
    async getMyTrades(
        @Request() req: { user: { userId: string } },
        @Query('status') status?: string,
    ) {
        return this.tradeCommandService.getMyTrades(req.user.userId, status);
    }

    @Get(':id')
    async getTrade(@Param('id') id: string) {
        return this.tradeCommandService.getTradeById(id);
    }
}
