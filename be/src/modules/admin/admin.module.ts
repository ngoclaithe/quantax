import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminConfigService } from './admin-config.service';
import { AdminMonitoringService } from './admin-monitoring.service';
import { RiskModule } from '../risk/risk.module';

@Module({
    imports: [RiskModule],
    controllers: [AdminController],
    providers: [AdminConfigService, AdminMonitoringService],
})
export class AdminModule { }
