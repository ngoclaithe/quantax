import { Controller, Post, Body } from '@nestjs/common';
import { WalletAuthService } from './wallet-auth.service';

@Controller('auth')
export class AuthController {
    constructor(private walletAuthService: WalletAuthService) { }

    @Post('wallet/login')
    async walletLogin(@Body() body: { walletAddress: string; signature: string }) {
        return this.walletAuthService.loginWithWallet(body.walletAddress, body.signature);
    }
}
