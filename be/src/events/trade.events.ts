export class TradeCreatedEvent {
    constructor(
        public readonly tradeId: string,
        public readonly userId: string,
        public readonly pairId: string,
        public readonly direction: 'UP' | 'DOWN',
        public readonly amount: number,
    ) { }
}

export class TradeSettledEvent {
    constructor(
        public readonly tradeId: string,
        public readonly userId: string,
        public readonly result: 'WIN' | 'LOSE',
        public readonly profit: number,
    ) { }
}
