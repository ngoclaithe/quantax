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

    const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                email: demoEmail,
                passwordHash: demoHash,
                nickname: 'DemoTrader',
                role: 'USER',
                wallet: {
                    create: {
                        balance: 1000,
                        lockedBalance: 0,
                    },
                },
            },
        });
        console.log('Demo user created');
        console.log('  Email:', demoEmail);
        console.log('  Password:', demoPassword);
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

