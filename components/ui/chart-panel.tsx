"use client";

import {
  AreaSeries,
  ColorType,
  createChart,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import type { PriceBar } from "@/types/prices";

type ChartPanelProps = {
  bars: PriceBar[];
  positive?: boolean;
  height?: number;
};

function toUtcTimestamp(date: string): UTCTimestamp {
  return (Date.parse(date) / 1000) as UTCTimestamp;
}

export function ChartPanel({ bars, positive = true, height = 140 }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

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
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        mode: 0,
        vertLine: {
          visible: true,
          labelVisible: false,
          color: "rgba(244, 247, 251, 0.25)",
          width: 1,
          style: LineStyle.Solid,
        },
        horzLine: { visible: false, labelVisible: false },
      },
    });

    chartRef.current = chart;

    const accentLine = positive ? "rgba(0, 229, 168, 1)" : "rgba(255, 104, 120, 1)";
    const accentTop = positive
      ? "rgba(0, 229, 168, 0.28)"
      : "rgba(255, 104, 120, 0.28)";
    const accentBottom = positive
      ? "rgba(0, 229, 168, 0.0)"
      : "rgba(255, 104, 120, 0.0)";

    const series = chart.addSeries(AreaSeries, {
      lineColor: accentLine,
      topColor: accentTop,
      bottomColor: accentBottom,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
      crosshairMarkerBorderColor: accentLine,
      crosshairMarkerBackgroundColor: "#05070a",
    });

    seriesRef.current = series;

    series.setData(
      bars.map((bar) => ({
        time: toUtcTimestamp(bar.date),
        value: bar.close,
      })),
    );

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [bars, positive]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height }}
      className="overflow-hidden"
    />
  );
}
