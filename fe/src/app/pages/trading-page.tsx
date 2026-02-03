import React from 'react';
import { useTradingStore } from '@/stores/trading-store';
import { useWalletStore } from '@/stores/wallet-store';
import { PriceChart } from '@/app/components/price-chart';
import { TradingPanel } from '@/app/components/trading-panel';
import { OrderList } from '@/app/components/order-list';
import { WalletConnectPrompt } from '@/app/components/wallet-connect-prompt';
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
  } = useTradingStore();
  const { isConnected } = useWalletStore();

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

  React.useEffect(() => {
    const generatePrice = () => {
      const basePrice = 43250;
      const variation = Math.sin(Date.now() / 10000) * 500 + (Math.random() - 0.5) * 100;
      return basePrice + variation;
    };

    const interval = setInterval(() => {
      const newPrice = generatePrice();
      updatePrice(newPrice);
    }, 2000);

    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: Date.now() - (20 - i) * 2000,
      price: generatePrice(),
    }));

    initialData.forEach((d) => updatePrice(d.price));

    return () => clearInterval(interval);
  }, [updatePrice]);

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
