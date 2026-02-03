import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { InternalOracleProvider } from './internal-oracle.provider';
import { IPriceFeed } from '../../common/interfaces';

@Injectable()
export class OracleService implements IPriceFeed {
    constructor(
        private prisma: PrismaService,
        private oracleProvider: InternalOracleProvider,
    ) { }

    async getPrice(pair: string): Promise<number> {
        const price = await this.oracleProvider.fetchPrice(pair);

        await this.prisma.priceFeedLog.create({
            data: { pair, price, source: 'internal' },
        });

        return price;
    }

    async getPriceWithTimestamp(pair: string) {
        const price = await this.getPrice(pair);
        return { price, timestamp: Date.now() };
    }
}
