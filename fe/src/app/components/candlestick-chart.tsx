import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, UTCTimestamp } from 'lightweight-charts';
import { formatNumber } from '@/lib/utils';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface CandleData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface ActiveOrder {
    id: string;
    entryPrice: number;
    direction: 'UP' | 'DOWN';
    timeframe: number;
    placedAt: number;
}

interface CandlestickChartProps {
    data: CandleData[];
    currentPrice: number;
    activeOrders?: ActiveOrder[];
    onPriceChange?: (price: number) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    currentPrice,
    activeOrders = [],
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candleSeriesRef = useRef<any>(null);
    const isInitializedRef = useRef(false);
    const lastDataLengthRef = useRef(0);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

    // Calculate price change
    useEffect(() => {
        if (data.length >= 2) {
            const prevClose = data[data.length - 2]?.close || currentPrice;
            const change = currentPrice - prevClose;
            const changePercent = (change / prevClose) * 100;
            setPriceChange(change);
            setPriceChangePercent(changePercent);
        }
    }, [currentPrice, data]);

    // Initialize chart - only once
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
            isInitializedRef.current = false;
        };
    }, []);

    // Update chart data - without resetting zoom
    useEffect(() => {
        if (!candleSeriesRef.current || data.length === 0) return;

        const formatTime = (timestamp: number): UTCTimestamp => {
            return Math.floor(timestamp / 1000) as UTCTimestamp;
        };

        // First time initialization - set all data and fit content
        if (!isInitializedRef.current) {
            const chartData = data.map((d) => ({
                time: formatTime(d.time),
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            }));
            candleSeriesRef.current.setData(chartData);

            // Fit content only on first load
            if (chartRef.current) {
                chartRef.current.timeScale().fitContent();
            }
            isInitializedRef.current = true;
            lastDataLengthRef.current = data.length;
            return;
        }

        // Real-time update - only update the last candle or add new one
        const lastCandle = data[data.length - 1];
        if (lastCandle) {
            const candleUpdate = {
                time: formatTime(lastCandle.time),
                open: lastCandle.open,
                high: lastCandle.high,
                low: lastCandle.low,
                close: lastCandle.close,
            };

            // If a new candle was added
            if (data.length > lastDataLengthRef.current) {
                // Update (add) the new candle without resetting view
                candleSeriesRef.current.update(candleUpdate);
                lastDataLengthRef.current = data.length;
            } else {
                // Just update the current candle (price change within same candle)
                candleSeriesRef.current.update(candleUpdate);
            }
        }
    }, [data]);

    // Update price lines for active orders
    useEffect(() => {
        if (!candleSeriesRef.current) return;

        // Add price lines for each active order
        activeOrders.forEach((order) => {
            try {
                candleSeriesRef.current?.createPriceLine({
                    price: order.entryPrice,
                    color: order.direction === 'UP' ? '#22c55e' : '#ef4444',
                    lineWidth: 2,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: order.direction === 'UP' ? '↑ Entry' : '↓ Entry',
                });
            } catch (e) {
                // Price line may already exist
            }
        });
    }, [activeOrders]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        if (chartRef.current) {
            const timeScale = chartRef.current.timeScale();
            const currentRange = timeScale.getVisibleLogicalRange();
            if (currentRange) {
                const newRange = {
                    from: currentRange.from + (currentRange.to - currentRange.from) * 0.2,
                    to: currentRange.to - (currentRange.to - currentRange.from) * 0.2,
                };
                timeScale.setVisibleLogicalRange(newRange);
            }
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (chartRef.current) {
            const timeScale = chartRef.current.timeScale();
            const currentRange = timeScale.getVisibleLogicalRange();
            if (currentRange) {
                const newRange = {
                    from: currentRange.from - (currentRange.to - currentRange.from) * 0.25,
                    to: currentRange.to + (currentRange.to - currentRange.from) * 0.25,
                };
                timeScale.setVisibleLogicalRange(newRange);
            }
        }
    }, []);

    const handleReset = useCallback(() => {
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, []);

    const isPriceUp = priceChange >= 0;

    return (
        <div className="h-full flex flex-col">
            {/* Header with price info */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold">${formatNumber(currentPrice)}</span>
                        <span className={`text-lg font-semibold ${isPriceUp ? 'text-success' : 'text-destructive'}`}>
                            {isPriceUp ? '+' : ''}{formatNumber(priceChange)} ({isPriceUp ? '+' : ''}{formatNumber(priceChangePercent)}%)
                        </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Giá hiện tại</div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        title="Reset View"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Active Orders Legend */}
            {activeOrders.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {activeOrders.map((order) => {
                        const isWinning = order.direction === 'UP'
                            ? currentPrice > order.entryPrice
                            : currentPrice < order.entryPrice;

                        return (
                            <div
                                key={order.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${order.direction === 'UP'
                                    ? 'bg-success/20 text-success border border-success/30'
                                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                                    }`}
                            >
                                <span>{order.direction === 'UP' ? '↑' : '↓'}</span>
                                <span>Entry: ${formatNumber(order.entryPrice)}</span>
                                <span className={isWinning ? 'text-success' : 'text-destructive'}>
                                    ({isWinning ? 'Đang thắng' : 'Đang thua'})
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Chart Container */}
            <div
                ref={chartContainerRef}
                className="flex-1 min-h-0 rounded-lg overflow-hidden"
            />
        </div>
    );
};


