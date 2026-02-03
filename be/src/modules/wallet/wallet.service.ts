import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async getWallet(userId: string) {
        return this.prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { take: 20, orderBy: { createdAt: 'desc' } } },
        });
    }

    async getBalance(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        return wallet ? { balance: wallet.balance, locked: wallet.lockedBalance } : null;
    }

    async lockBalance(userId: string, amount: number) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet || Number(wallet.balance) < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        return this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId },
                data: {
                    balance: { decrement: amount },
                    lockedBalance: { increment: amount },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'LOCK',
                    amount,
                },
            }),
        ]);
    }

    async unlockBalance(userId: string, amount: number) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return;

        return this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId },
                data: {
                    balance: { increment: amount },
                    lockedBalance: { decrement: amount },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'UNLOCK',
                    amount,
                },
            }),
        ]);
    }

    async settleWin(userId: string, amount: number, profit: number) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return;

        return this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId },
                data: {
                    balance: { increment: amount + profit },
                    lockedBalance: { decrement: amount },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'SETTLE',
                    amount: profit,
                },
            }),
        ]);
    }

    async settleLose(userId: string, amount: number) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return;

        return this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId },
                data: {
                    lockedBalance: { decrement: amount },
                },
            }),
            this.prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'SETTLE',
                    amount: -amount,
                },
            }),
        ]);
    }
}
