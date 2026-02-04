import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class DepositController {
    constructor(private prisma: PrismaService) { }

    // Get active banks for deposit
    @Get('banks')
    async getActiveBanks() {
        return this.prisma.bankAccount.findMany({
            where: { isActive: true },
        });
    }

    // Create deposit order
    @Post('deposit')
    async createDeposit(@Request() req: any, @Body() body: { amount: number; bankId: string }) {
        const userId = req.user.userId;
        const codePay = this.generateCodePay();

        // Expiration 15 mins
        const expiredAt = new Date();
        expiredAt.setMinutes(expiredAt.getMinutes() + 15);

        const deposit = await this.prisma.depositOrder.create({
            data: {
                userId,
                bankAccountId: body.bankId,
                amount: body.amount,
                codePay,
                expiredAt,
                status: 'PENDING',
            },
            include: {
                bankAccount: true,
            },
        });

        return deposit;
    }

    // Get user deposits
    @Get('deposits')
    async getMyDeposits(@Request() req: any) {
        return this.prisma.depositOrder.findMany({
            where: { userId: req.user.userId },
            include: { bankAccount: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    private generateCodePay(): string {
        // Generate 6 random alphanumeric characters
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
