import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminConfigService } from './admin-config.service';
import { AdminMonitoringService } from './admin-monitoring.service';
import { AdminAuthService } from './admin-auth.service';
import { RiskModule } from '../risk/risk.module';
import { OracleModule } from '../oracle/oracle.module';

import { AdminBankService } from './admin-bank.service';

import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [
        WalletModule,
        RiskModule,
        OracleModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AdminController, AdminAuthController],
    providers: [
        AdminConfigService,
        AdminMonitoringService,
        AdminAuthService,
        AdminBankService // Add here
    ],
})
export class AdminModule { }
