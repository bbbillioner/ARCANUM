"use client";

import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { sliceByTimeframe } from "@/lib/prices";
import type { PriceBar, Timeframe } from "@/types/prices";

type ChartType = "area" | "candles";

type ChartFullProps = {
  bars: PriceBar[];
  defaultTimeframe?: Timeframe;
  defaultType?: ChartType;
  height?: number;
};

type Hover = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
};

const timeframes: Timeframe[] = ["1M", "3M", "6M", "1Y", "5Y", "ALL"];

function toUtcTimestamp(date: string): UTCTimestamp {
  return (Date.parse(date) / 1000) as UTCTimestamp;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toString();
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function buildHover(bar: PriceBar, prevClose: number): Hover {
  const change = bar.close - prevClose;
  const changePercent = prevClose === 0 ? 0 : (change / prevClose) * 100;
  return {
    date: bar.date,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
    change,
    changePercent,
  };
}

export function ChartFull({
  bars,
  defaultTimeframe = "1Y",
  defaultType = "candles",
  height = 460,
}: ChartFullProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe);
  const [chartType, setChartType] = useState<ChartType>(defaultType);

  const visibleBars = useMemo(
    () => sliceByTimeframe(bars, timeframe),
    [bars, timeframe],
  );

  const positive = useMemo(() => {
    if (visibleBars.length < 2) return true;
    return (
      visibleBars[visibleBars.length - 1].close >= visibleBars[0].close
    );
  }, [visibleBars]);

  const latestHover: Hover | null = useMemo(() => {
    if (visibleBars.length === 0) return null;
    const last = visibleBars[visibleBars.length - 1];
    const prevClose =
      visibleBars.length > 1
        ? visibleBars[visibleBars.length - 2].close
        : last.open;
    return buildHover(last, prevClose);
  }, [visibleBars]);

  const [hover, setHover] = useState<Hover | null>(null);
  const activeHover = hover ?? latestHover;

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(244, 247, 251, 0.55)",
        fontFamily:
          "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(244, 247, 251, 0.25)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#070a10",
        },
        horzLine: {
          color: "rgba(244, 247, 251, 0.25)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#070a10",
        },
      },
    });

    chartRef.current = chart;

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "rgba(94, 234, 212, 0.35)",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });
    volumeRef.current = volume;

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHover(null);
        return;
      }

      const dateStr =
        typeof param.time === "number"
          ? new Date((param.time as number) * 1000).toISOString().slice(0, 10)
          : String(param.time);

      const index = visibleBars.findIndex((bar) => bar.date === dateStr);
      if (index < 0) {
        setHover(null);
        return;
      }

      const bar = visibleBars[index];
      const prevClose = index > 0 ? visibleBars[index - 1].close : bar.open;
      setHover(buildHover(bar, prevClose));
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      areaRef.current = null;
      volumeRef.current = null;
    };
  }, [visibleBars]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (candleRef.current) {
      chart.removeSeries(candleRef.current);
      candleRef.current = null;
    }
    if (areaRef.current) {
      chart.removeSeries(areaRef.current);
      areaRef.current = null;
    }

    if (chartType === "candles") {
      const candle = chart.addSeries(CandlestickSeries, {
        upColor: "rgba(94, 234, 212, 0.95)",
        downColor: "rgba(244, 114, 128, 0.95)",
        borderUpColor: "rgba(94, 234, 212, 1)",
        borderDownColor: "rgba(244, 114, 128, 1)",
        wickUpColor: "rgba(94, 234, 212, 0.65)",
        wickDownColor: "rgba(244, 114, 128, 0.65)",
        priceLineVisible: false,
      });
      candle.setData(
        visibleBars.map((bar) => ({
          time: toUtcTimestamp(bar.date),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        })),
      );
      candleRef.current = candle;
    } else {
      const accentLine = positive
        ? "rgba(94, 234, 212, 1)"
        : "rgba(244, 114, 128, 1)";
      const accentTop = positive
        ? "rgba(94, 234, 212, 0.28)"
        : "rgba(244, 114, 128, 0.28)";
      const accentBottom = positive
        ? "rgba(94, 234, 212, 0)"
        : "rgba(244, 114, 128, 0)";

      const area = chart.addSeries(AreaSeries, {
        lineColor: accentLine,
        topColor: accentTop,
        bottomColor: accentBottom,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      area.setData(
        visibleBars.map((bar) => ({
          time: toUtcTimestamp(bar.date),
          value: bar.close,
        })),
      );
      areaRef.current = area;
    }

    const volume = volumeRef.current;
    if (volume) {
      volume.setData(
        visibleBars.map((bar, index) => {
          const prevClose = index > 0 ? visibleBars[index - 1].close : bar.open;
          const isUp = bar.close >= prevClose;
          return {
            time: toUtcTimestamp(bar.date),
            value: bar.volume,
            color: isUp
              ? "rgba(94, 234, 212, 0.35)"
              : "rgba(244, 114, 128, 0.35)",
          };
        }),
      );
    }

    chart.timeScale().fitContent();
  }, [visibleBars, chartType, positive]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070a10]/70 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Tooltip hover={activeHover} />
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(["area", "candles"] as const).map((type) => (
              <button
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  chartType === type
                    ? "bg-teal-300 text-zinc-950"
                    : "text-zinc-400 hover:text-white",
                )}
                key={type}
                onClick={() => setChartType(type)}
                type="button"
              >
                {type === "area" ? "Area" : "Candles"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {timeframes.map((tf) => (
              <button
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  timeframe === tf
                    ? "bg-white/15 text-white"
                    : "text-zinc-400 hover:text-white",
                )}
                key={tf}
                onClick={() => setTimeframe(tf)}
                type="button"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ width: "100%", height }}
        className="mt-4 overflow-hidden"
      />
    </div>
  );
}

function Tooltip({ hover }: { hover: Hover | null }) {
  if (!hover) {
    return (
      <div className="text-sm text-zinc-500">No data in this timeframe.</div>
    );
  }

  const positive = hover.change >= 0;

  return (
    <div className="grid gap-2">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        {formatDate(hover.date)}
      </p>
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-2xl font-semibold text-white">
          {formatCurrency(hover.close)}
        </p>
        <p
          className={cn(
            "text-sm font-semibold",
            positive ? "text-teal-200" : "text-rose-200",
          )}
        >
          {positive ? "+" : ""}
          {formatCurrency(hover.change)} ({positive ? "+" : ""}
          {hover.changePercent.toFixed(2)}%)
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>
          <span className="text-zinc-600">O</span>{" "}
          <span className="font-mono text-zinc-300">
            {formatCurrency(hover.open)}
          </span>
        </span>
        <span>
          <span className="text-zinc-600">H</span>{" "}
          <span className="font-mono text-zinc-300">
            {formatCurrency(hover.high)}
          </span>
        </span>
        <span>
          <span className="text-zinc-600">L</span>{" "}
          <span className="font-mono text-zinc-300">
            {formatCurrency(hover.low)}
          </span>
        </span>
        <span>
          <span className="text-zinc-600">Vol</span>{" "}
          <span className="font-mono text-zinc-300">
            {formatVolume(hover.volume)}
          </span>
        </span>
      </div>
    </div>
  );
}
