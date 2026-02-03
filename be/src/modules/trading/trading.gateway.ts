import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { TradeCreatedEvent, TradeSettledEvent } from '../../events/trade.events';
import { OracleService } from '../oracle/oracle.service';

@WebSocketGateway({ cors: true })
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private priceInterval: NodeJS.Timeout;
    private readonly PRICE_PAIRS = ['BTC/USD', 'ETH/USD', 'BNB/USD'];

    constructor(private oracleService: OracleService) { }

    afterInit() {
        // Start price broadcast when gateway initializes
        this.startPriceBroadcast();
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        // Auto-subscribe new clients to all price feeds
        this.PRICE_PAIRS.forEach((pair) => client.join(`price:${pair}`));
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribe:price')
    handleSubscribePrice(client: Socket, pairs: string[]) {
        pairs.forEach((pair) => client.join(`price:${pair}`));
        return { event: 'subscribed', data: pairs };
    }

    @SubscribeMessage('unsubscribe:price')
    handleUnsubscribePrice(client: Socket, pairs: string[]) {
        pairs.forEach((pair) => client.leave(`price:${pair}`));
        return { event: 'unsubscribed', data: pairs };
    }

    @SubscribeMessage('get:prices')
    async handleGetPrices() {
        const prices: { pair: string; price: number; timestamp: number }[] = [];
        for (const pair of this.PRICE_PAIRS) {
            const price = await this.oracleService.getPrice(pair);
            prices.push({ pair, price, timestamp: Date.now() });
        }
        return { event: 'prices', data: prices };
    }

    @OnEvent('trade.created')
    handleTradeCreated(event: TradeCreatedEvent) {
        this.server.emit('trade:created', event);
    }

    @OnEvent('trade.settled')
    handleTradeSettled(event: TradeSettledEvent) {
        this.server.emit('trade:settled', event);
    }

    async broadcastPrice(pair: string, price: number) {
        this.server.to(`price:${pair}`).emit('price:update', { pair, price, timestamp: Date.now() });
        // Also broadcast to all connected clients
        this.server.emit('price:update', { pair, price, timestamp: Date.now() });
    }

    startPriceBroadcast() {
        console.log('Starting price broadcast...');
        this.priceInterval = setInterval(async () => {
            for (const pair of this.PRICE_PAIRS) {
                const price = await this.oracleService.getPrice(pair);
                this.broadcastPrice(pair, price);
            }
        }, 1000);
    }

    stopPriceBroadcast() {
        if (this.priceInterval) {
            clearInterval(this.priceInterval);
        }
    }
}
