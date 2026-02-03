import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CopyTradeService } from './copy-trade.service';

@Controller('copy-trade')
export class CopyTradeController {
    constructor(private copyTradeService: CopyTradeService) { }

    @Get('traders')
    async getTraders() {
        return this.copyTradeService.getTopTraders();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('follow')
    async follow(
        @Request() req: { user: { userId: string } },
        @Body() body: { traderId: string; copyType: 'FIXED' | 'PERCENT'; value: number; maxAmount: number },
    ) {
        return this.copyTradeService.followTrader(
            req.user.userId,
            body.traderId,
            body.copyType,
            body.value,
            body.maxAmount,
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('unfollow')
    async unfollow(
        @Request() req: { user: { userId: string } },
        @Body() body: { traderId: string },
    ) {
        return this.copyTradeService.unfollowTrader(req.user.userId, body.traderId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('following')
    async getFollowing(@Request() req: { user: { userId: string } }) {
        return this.copyTradeService.getFollowing(req.user.userId);
    }
}
