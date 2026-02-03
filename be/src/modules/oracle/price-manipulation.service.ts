import { Injectable } from '@nestjs/common';

export interface PriceTarget {
    pair: string;
    targetPrice: number;
    startTime: Date;
    endTime: Date;
    direction: 'UP' | 'DOWN' | 'STABLE';
}

@Injectable()
export class PriceManipulationService {
    // In-memory storage for price targets (could be moved to Redis for persistence)
    private priceTargets: Map<string, PriceTarget> = new Map();

    // Base prices for symbols
    private basePrices: Map<string, number> = new Map([
        ['BTC/USD', 43000],
        ['ETH/USD', 2200],
        ['BNB/USD', 310],
    ]);

    // Current manipulated prices
    private currentPrices: Map<string, number> = new Map();

    constructor() {
        // Initialize current prices with base prices
        this.basePrices.forEach((price, pair) => {
            this.currentPrices.set(pair, price);
        });
    }

    /**
     * Set a price target for a symbol
     * The price will gradually move towards the target during the specified timeframe
     */
    async setPriceTarget(
        pair: string,
        targetPrice: number,
        durationSeconds: number,
    ): Promise<PriceTarget> {
        const currentPrice = this.getCurrentPrice(pair);
        const direction = targetPrice > currentPrice ? 'UP' : targetPrice < currentPrice ? 'DOWN' : 'STABLE';

        const target: PriceTarget = {
            pair,
            targetPrice,
            startTime: new Date(),
            endTime: new Date(Date.now() + durationSeconds * 1000),
            direction,
        };

        this.priceTargets.set(pair, target);

        // Log the manipulation for audit (log to console for now)
        console.log(`[PriceManipulation] Target set: ${pair} from ${currentPrice} to ${targetPrice} in ${durationSeconds}s (${direction})`);

        return target;
    }

    /**
     * Get the current manipulated price for a pair
     * Smoothly transitions towards target if one is set
     */
    getManipulatedPrice(pair: string): number {
        const target = this.priceTargets.get(pair);
        const basePrice = this.currentPrices.get(pair) || this.basePrices.get(pair) || 100;

        if (!target) {
            // No target set, add small random variation
            const variation = (Math.random() - 0.5) * basePrice * 0.001;
            const newPrice = basePrice + variation;
            this.currentPrices.set(pair, newPrice);
            return newPrice;
        }

        const now = new Date();

        // Check if target period has ended
        if (now >= target.endTime) {
            // Target reached, remove it
            this.priceTargets.delete(pair);
            this.currentPrices.set(pair, target.targetPrice);
            // Update base price to the new target
            this.basePrices.set(pair, target.targetPrice);
            return target.targetPrice;
        }

        // Calculate progress towards target
        const totalDuration = target.endTime.getTime() - target.startTime.getTime();
        const elapsed = now.getTime() - target.startTime.getTime();
        const progress = elapsed / totalDuration;

        const startPrice = this.basePrices.get(pair) || 100;
        const priceDiff = target.targetPrice - startPrice;

        // Ease-in-out interpolation for smoother price movement
        const easedProgress = this.easeInOutQuad(progress);
        const interpolatedPrice = startPrice + priceDiff * easedProgress;

        // Add small random noise
        const noise = (Math.random() - 0.5) * Math.abs(priceDiff) * 0.01;
        const finalPrice = interpolatedPrice + noise;

        this.currentPrices.set(pair, finalPrice);
        return finalPrice;
    }

    /**
     * Get current price without manipulation calculation
     */
    getCurrentPrice(pair: string): number {
        return this.currentPrices.get(pair) || this.basePrices.get(pair) || 100;
    }

    /**
     * Get all active price targets
     */
    getActivePriceTargets(): PriceTarget[] {
        const now = new Date();
        const activeTargets: PriceTarget[] = [];

        this.priceTargets.forEach((target, pair) => {
            if (now < target.endTime) {
                activeTargets.push(target);
            } else {
                this.priceTargets.delete(pair);
            }
        });

        return activeTargets;
    }

    /**
     * Cancel a price target
     */
    cancelPriceTarget(pair: string): boolean {
        return this.priceTargets.delete(pair);
    }

    /**
     * Set the base price for a pair (immediate change)
     */
    setBasePrice(pair: string, price: number): void {
        this.basePrices.set(pair, price);
        this.currentPrices.set(pair, price);
    }

    /**
     * Get all base prices
     */
    getAllBasePrices(): { pair: string; price: number }[] {
        const prices: { pair: string; price: number }[] = [];
        this.basePrices.forEach((price, pair) => {
            prices.push({ pair, price: this.currentPrices.get(pair) || price });
        });
        return prices;
    }

    /**
     * Ease-in-out quadratic function for smooth interpolation
     */
    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}
