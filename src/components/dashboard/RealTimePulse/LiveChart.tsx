/**
 * Real-time area chart visualization for impression flow using Recharts.
 */
import React, { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
} from "recharts";
import { formatNumber } from "@/lib/format";
import { getCampaignColor } from "@/lib/colors";
import { LiveChartProps } from "./types";
import { getScaleTicks, TOTAL_COLOR } from "./utils";
import { CustomTooltip } from "./CustomTooltip";

export const LiveChart = React.memo(({ pulseData }: LiveChartProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
    if (!pulseData?.data || pulseData.data.length === 0) return [];

    const data = [...pulseData.data];
    const lastPoint = data[data.length - 1];

    if (now > (lastPoint.time as number) + 2000) {
      data.push({
        ...lastPoint,
        time: now,
      });
    }

    return data;
  }, [pulseData, now]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(
      ...chartData.map((d) => {
        return Object.entries(d)
          .filter(([k]) => k.startsWith("ts:campaign"))
          .reduce((acc, [_, v]) => acc + Number(v), 0);
      }),
    );
  }, [chartData]);

  const ticks = useMemo(() => getScaleTicks(maxVal), [maxVal]);

  return (
    <div className="h-full w-full absolute inset-0 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            {pulseData.series.map((s, i) => {
              const color = i === 0 ? TOTAL_COLOR : getCampaignColor(i - 1);
              return (
                <linearGradient
                  key={`grad-${s.key}`}
                  id={`grad-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <YAxis
            axisLine={false}
            tickLine={false}
            width={30}
            fontSize={8}
            tickFormatter={formatNumber}
            ticks={ticks}
            domain={[
              0,
              (max: number) => Math.max(max, ticks[ticks.length - 1]),
            ]}
            className="font-mono opacity-40"
          />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            fontSize={8}
            tickFormatter={(time) =>
              new Date(time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            minTickGap={30}
            className="font-mono opacity-40"
          />
          <Tooltip content={<CustomTooltip pulseData={pulseData} />} />
          {pulseData.series.map((s, i) => {
            if (s.key.includes(":global") || s.key.includes(":brand:"))
              return null;

            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={getCampaignColor(i - 1)}
                strokeWidth={1}
                fillOpacity={1}
                fill={`url(#grad-${s.key})`}
                isAnimationActive={false}
                stackId="campaigns"
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

LiveChart.displayName = "LiveChart";
