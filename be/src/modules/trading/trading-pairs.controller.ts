import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Controller('trading-pairs')
export class TradingPairsController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getPairs() {
        const pairs = await this.prisma.tradingPair.findMany({
            where: { isActive: true },
            orderBy: { symbol: 'asc' },
        });
        return pairs;
    }

    @Get('candles')
    async getCandles(@Query('symbol') symbol: string, @Query('limit') limit: string) {
        const limitNum = limit ? parseInt(limit) : 100;
        const targetSymbol = symbol || 'BTC/USD';

        const candles = await this.prisma.priceCandle.findMany({
            where: { symbol: targetSymbol },
            orderBy: { time: 'desc' },
            take: limitNum,
        });

        return candles.reverse().map(c => ({
            time: c.time.getTime(),
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
        }));
    }
}
