import { Injectable } from '@nestjs/common';
import { IOracleProvider } from '../../common/interfaces';

@Injectable()
export class InternalOracleProvider implements IOracleProvider {
    private prices: Record<string, number> = {
        'BTC/USD': 43000,
        'ETH/USD': 2200,
        'BNB/USD': 310,
    };

    async fetchPrice(pair: string): Promise<number> {
        const base = this.prices[pair] || 100;
        const variation = (Math.random() - 0.5) * base * 0.02;
        return base + variation;
    }
}
