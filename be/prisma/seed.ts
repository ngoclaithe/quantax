import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

    console.log('Seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
