export class CopyTradeTriggeredEvent {
    constructor(
        public readonly sourceTradeId: string,
        public readonly traderId: string,
        public readonly pairId: string,
        public readonly direction: 'UP' | 'DOWN',
        public readonly amount: number,
    ) { }
}
