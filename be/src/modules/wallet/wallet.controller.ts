import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
    constructor(private walletService: WalletService) { }

    @Get()
    async getWallet(@Request() req: { user: { userId: string } }) {
        return this.walletService.getWallet(req.user.userId);
    }

    @Get('transactions')
    async getTransactions(@Request() req: { user: { userId: string } }) {
        const wallet = await this.walletService.getWallet(req.user.userId);
        return wallet?.transactions || [];
    }
}
