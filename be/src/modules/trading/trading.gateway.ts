import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { TradeCreatedEvent, TradeSettledEvent } from '../../events/trade.events';
import { OracleService } from '../oracle/oracle.service';

@WebSocketGateway({ cors: true })
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private priceInterval: NodeJS.Timeout;

    constructor(private oracleService: OracleService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
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
    }

    startPriceBroadcast() {
        const pairs = ['BTC/USD', 'ETH/USD', 'BNB/USD'];
        this.priceInterval = setInterval(async () => {
            for (const pair of pairs) {
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
