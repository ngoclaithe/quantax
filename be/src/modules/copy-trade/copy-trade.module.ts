import { Module, forwardRef } from '@nestjs/common';
import { CopyTradeService } from './copy-trade.service';
import { CopyExecutionService } from './copy-execution.service';
import { CopyTradeController } from './copy-trade.controller';
import { TradingModule } from '../trading/trading.module';

@Module({
    imports: [forwardRef(() => TradingModule)],
    controllers: [CopyTradeController],
    providers: [CopyTradeService, CopyExecutionService],
    exports: [CopyTradeService],
})
export class CopyTradeModule { }
