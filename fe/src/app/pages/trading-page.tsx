import React from 'react';
import { useTradingStore } from '@/stores/trading-store';
import { useWalletStore } from '@/stores/wallet-store';
import { PriceChart } from '@/app/components/price-chart';
import { TradingPanel } from '@/app/components/trading-panel';
import { OrderList } from '@/app/components/order-list';
import { WalletConnectPrompt } from '@/app/components/wallet-connect-prompt';
import { socketService } from '@/lib/socket';
import * as Tabs from '@radix-ui/react-tabs';

export const TradingPage: React.FC = () => {
  const {
    priceHistory,
    currentPrice,
    openOrders,
    closedOrders,
    updatePrice,
    fetchPairs,
    fetchMyTrades,
    selectedPair,
  } = useTradingStore();
  const { isConnected } = useWalletStore();

  // Connect to WebSocket and subscribe to price updates
  React.useEffect(() => {
    socketService.connect();

    const handlePriceUpdate = (data: { pair: string; price: number }) => {
      // Only update if it matches the selected pair or if no pair is selected (use first one)
      if (!selectedPair || data.pair === selectedPair.symbol) {
        updatePrice(data.price);
      }
    };

    socketService.onPriceUpdate(handlePriceUpdate);

    return () => {
      socketService.offPriceUpdate(handlePriceUpdate);
    };
  }, [updatePrice, selectedPair]);

  React.useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  React.useEffect(() => {
    if (isConnected) {
      fetchMyTrades();
      const interval = setInterval(fetchMyTrades, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchMyTrades]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <WalletConnectPrompt />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 h-[500px]">
            <PriceChart data={priceHistory} currentPrice={currentPrice} />
          </div>
        </div>

        <div>
          <TradingPanel />
        </div>
      </div>

      <div className="mt-6">
        <Tabs.Root defaultValue="open">
          <Tabs.List className="flex gap-2 border-b border-border mb-4">
            <Tabs.Trigger
              value="open"
              className="px-4 py-2 rounded-t-xl data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              Lệnh đang mở ({openOrders.length})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="closed"
              className="px-4 py-2 rounded-t-xl data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              Lịch sử ({closedOrders.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="open">
            <OrderList orders={openOrders} title="Lệnh đang mở" type="open" />
          </Tabs.Content>

          <Tabs.Content value="closed">
            <OrderList orders={closedOrders.slice(0, 10)} title="Lịch sử giao dịch" type="closed" />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

