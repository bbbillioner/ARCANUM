"use client";

import {
  ColorType,
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import type { PriceBar } from "@/types/prices";

type CompareChartProps = {
  aTicker: string;
  aBars: PriceBar[];
  bTicker: string;
  bBars: PriceBar[];
  height?: number;
};

function toUtcTimestamp(date: string): UTCTimestamp {
  return (Date.parse(date) / 1000) as UTCTimestamp;
}

// Normalise a bar series to start at 100. Returns aligned points for chart.
function normaliseToIndex(bars: PriceBar[]): Array<{ time: UTCTimestamp; value: number }> {
  if (bars.length === 0) return [];
  const base = bars[0].close;
  if (base <= 0) return [];
  return bars.map((b) => ({
    time: toUtcTimestamp(b.date),
    value: (b.close / base) * 100,
  }));
}

export function CompareChart({
  aTicker,
  aBars,
  bTicker,
  bBars,
  height = 360,
}: CompareChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const aRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.55)",
        fontFamily:
          "var(--font-inter), system-ui, -apple-system, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(255, 255, 255, 0.25)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#070a10",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.25)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#070a10",
        },
      },
    });
    chartRef.current = chart;

    const aSeries = chart.addSeries(LineSeries, {
      color: "rgba(0, 229, 168, 1)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: aTicker,
    });
    aSeries.setData(normaliseToIndex(aBars));
    aRef.current = aSeries;

    const bSeries = chart.addSeries(LineSeries, {
      color: "rgba(240, 183, 110, 1)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: bTicker,
    });
    bSeries.setData(normaliseToIndex(bBars));
    bRef.current = bSeries;

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      aRef.current = null;
      bRef.current = null;
    };
  }, [aTicker, aBars, bTicker, bBars]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      className="overflow-hidden"
    />
  );
}
