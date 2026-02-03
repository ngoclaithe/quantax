import { Module, forwardRef } from '@nestjs/common';
import { TradeCommandService } from './trade-command.service';
import { TradeSettlementService } from './trade-settlement.service';
import { TradeSchedulerService } from './trade-scheduler.service';
import { TradingController } from './trading.controller';
import { TradingGateway } from './trading.gateway';
import { WalletModule } from '../wallet/wallet.module';
import { UserModule } from '../user/user.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
    imports: [WalletModule, UserModule, OracleModule],
    controllers: [TradingController],
    providers: [TradeCommandService, TradeSettlementService, TradeSchedulerService, TradingGateway],
    exports: [TradeCommandService, TradeSettlementService],
})
export class TradingModule { }
