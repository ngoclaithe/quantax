import { create } from 'zustand';
import { api } from '@/lib/api';
import { useAuthStore } from './auth-store';

export type OrderStatus = 'PENDING' | 'LOCKED' | 'SETTLED';
export type OrderResult = 'WIN' | 'LOSE' | null;
export type OrderDirection = 'UP' | 'DOWN';

export interface Trade {
  id: string;
  pair: { symbol: string };
  pairId: string;
  direction: OrderDirection;
  amount: number;
  payoutRate: number;
  entryPrice: number;
  openTime: string;
  expireTime: string;
  status: OrderStatus;
  result?: { result: 'WIN' | 'LOSE'; profit: number; settlePrice: number };
}

export interface TradingPair {
  id: string;
  symbol: string;
  payoutRate: number;
  isActive: boolean;
}

interface TradingState {
  selectedPair: TradingPair | null;
  pairs: TradingPair[];
  timeframe: number;
  amount: number;
  openOrders: Trade[];
  closedOrders: Trade[];
  currentPrice: number;
  priceHistory: { time: number; price: number }[];
  isLoading: boolean;

  fetchPairs: () => Promise<void>;
  setSelectedPair: (pair: TradingPair) => void;
  setTimeframe: (timeframe: number) => void;
  setAmount: (amount: number) => void;
  placeTrade: (direction: OrderDirection) => Promise<void>;
  fetchMyTrades: () => Promise<void>;
  updatePrice: (price: number) => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  selectedPair: null,
  pairs: [],
  timeframe: 60,
  amount: 10,
  openOrders: [],
  closedOrders: [],
  currentPrice: 43250.5,
  priceHistory: [],
  isLoading: false,

  fetchPairs: async () => {
    try {
      const pairs = await api.get<TradingPair[]>('/admin/pairs');
      const activePairs = pairs.filter((p) => p.isActive);
      set({ pairs: activePairs, selectedPair: activePairs[0] || null });
    } catch (e) {
      console.error('Failed to fetch pairs', e);
    }
  },

  setSelectedPair: (pair) => set({ selectedPair: pair }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setAmount: (amount) => set({ amount }),

  placeTrade: async (direction) => {
    const state = get();
    const token = useAuthStore.getState().token;
    if (!state.selectedPair || !token) return;

    set({ isLoading: true });
    try {
      await api.post(
        '/trades',
        {
          pairId: state.selectedPair.id,
          direction,
          amount: state.amount,
          timeframe: state.timeframe,
        },
        token
      );
      await get().fetchMyTrades();
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyTrades: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const trades = await api.get<Trade[]>('/trades/my', token);
      set({
        openOrders: trades.filter((t) => t.status !== 'SETTLED'),
        closedOrders: trades.filter((t) => t.status === 'SETTLED'),
      });
    } catch (e) {
      console.error('Failed to fetch trades', e);
    }
  },

  updatePrice: (price) => {
    set((state) => ({
      currentPrice: price,
      priceHistory: [...state.priceHistory.slice(-100), { time: Date.now(), price }],
    }));
  },
}));
