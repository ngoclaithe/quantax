import { Module } from '@nestjs/common';
import { AdminBankController } from './bank.controller';
import { DepositController } from './deposit.controller';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
    controllers: [AdminBankController, DepositController, WalletController],
    providers: [WalletService],
    exports: [WalletService],
})
export class WalletModule { }
