import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminConfigService } from './admin-config.service';
import { AdminMonitoringService } from './admin-monitoring.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(
        private configService: AdminConfigService,
        private monitoringService: AdminMonitoringService,
    ) { }

    @Get('dashboard')
    async getDashboard() {
        return this.monitoringService.getDashboard();
    }

    @Get('trades')
    async getTrades(@Query('status') status?: string) {
        return this.monitoringService.getTrades(status);
    }

    @Get('pairs')
    async getPairs() {
        return this.configService.getTradingPairs();
    }

    @Post('pairs')
    async createPair(@Body() body: { symbol: string; payoutRate: number }) {
        return this.configService.createPair(body.symbol, body.payoutRate);
    }

    @Patch('pairs/:id')
    async updatePair(@Param('id') id: string, @Body() body: { payoutRate?: number; isActive?: boolean }) {
        return this.configService.updatePair(id, body);
    }

    @Post('system/pause')
    async pause() {
        return this.configService.pauseTrading();
    }

    @Post('system/resume')
    async resume() {
        return this.configService.resumeTrading();
    }
}
