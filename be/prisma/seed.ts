import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Seed trading pairs
    const pairs = [
        { symbol: 'BTC/USD', payoutRate: 0.85 },
        { symbol: 'ETH/USD', payoutRate: 0.85 },
        { symbol: 'BNB/USD', payoutRate: 0.80 },
        { symbol: 'SOL/USD', payoutRate: 0.80 },
        { symbol: 'XRP/USD', payoutRate: 0.75 },
    ];

    for (const pair of pairs) {
        await prisma.tradingPair.upsert({
            where: { symbol: pair.symbol },
            update: {},
            create: pair,
        });
    }
    console.log('Trading pairs seeded');

    // Seed admin user
    const adminEmail = 'admin@quantax.io';
    const adminPassword = 'QuantaxAdmin@2024!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: hashedPassword,
            role: 'admin',
        },
    });
    console.log('Admin user seeded');
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);

    // Seed demo user
    const demoEmail = 'demo@quantax.io';
    const demoPassword = 'demo123';
    const demoHash = await bcrypt.hash(demoPassword, 10);


    // Seed Master Traders
    const masters = [
        {
            email: 'master1@quantax.io',
            password: 'password123',
            nickname: 'ProTrader_X',
            bio: 'Full-time crypto trader since 2017. High accuracy.',
            stats: { totalTrades: 150, winTrades: 120, loseTrades: 30, totalPnl: 5400, winRate: 80 }
        },
        {
            email: 'master2@quantax.io',
            password: 'password123',
            nickname: 'CryptoKing',
            bio: 'Conservative strategy. Low risk, steady growth.',
            stats: { totalTrades: 80, winTrades: 50, loseTrades: 30, totalPnl: 1200, winRate: 62.5 }
        },
        {
            email: 'master3@quantax.io',
            password: 'password123',
            nickname: 'RiskTaker',
            bio: 'High risk high reward scalping.',
            stats: { totalTrades: 300, winTrades: 140, loseTrades: 160, totalPnl: -500, winRate: 46.6 }
        }
    ];

    for (const master of masters) {
        const hash = await bcrypt.hash(master.password, 10);
        const existing = await prisma.user.findUnique({ where: { email: master.email } });

        if (!existing) {
            const user = await prisma.user.create({
                data: {
                    email: master.email,
                    passwordHash: hash,
                    nickname: master.nickname,
                    bio: master.bio,
                    role: 'TRADER',
                    isPublic: true,
                    wallet: {
                        create: { balance: 5000, lockedBalance: 0 }
                    },
                    stats: {
                        create: {
                            totalTrades: master.stats.totalTrades,
                            winTrades: master.stats.winTrades,
                            loseTrades: master.stats.loseTrades,
                            totalPnl: master.stats.totalPnl,
                            winRate: master.stats.winRate,
                        }
                    },
                    copyTrader: {
                        create: {
                            isEnabled: true,
                            riskScore: Math.floor(Math.random() * 100),
                        }
                    }
                }
            });
            console.log(`Master trader created: ${master.nickname}`);
        }
    }

    // Seed Copiers
    const copiers = [
        { email: 'copier1@quantax.io', nickname: 'CopierOne' },
        { email: 'copier2@quantax.io', nickname: 'CopierTwo' },
    ];

    for (const copier of copiers) {
        const hash = await bcrypt.hash('password123', 10);
        const existing = await prisma.user.findUnique({ where: { email: copier.email } });

        if (!existing) {
            await prisma.user.create({
                data: {
                    email: copier.email,
                    passwordHash: hash,
                    nickname: copier.nickname,
                    role: 'USER',
                    wallet: {
                        create: { balance: 1000, lockedBalance: 0 }
                    }
                }
            });
            console.log(`Copier created: ${copier.nickname}`);
        }
    }

    // Seed Follow Relationship
    const followerUser = await prisma.user.findUnique({ where: { email: 'copier1@quantax.io' } });
    const masterUser = await prisma.user.findUnique({ where: { email: 'master1@quantax.io' } });

    if (followerUser && masterUser) {
        await prisma.copyFollower.upsert({
            where: {
                followerId_traderId: {
                    followerId: followerUser.id,
                    traderId: masterUser.id,
                },
            },
            update: {},
            create: {
                followerId: followerUser.id,
                traderId: masterUser.id,
                copyType: 'FIXED',
                copyValue: 10, // Copy $10 per trade
                maxAmount: 50, // Max $50 per trade
                isActive: true,
            },
        });
        console.log(`Link created: ${followerUser.nickname} follows ${masterUser.nickname}`);
    }

    console.log('\\nSeed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

