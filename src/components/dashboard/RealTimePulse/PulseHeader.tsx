/**
 * Header component for RealTimePulse with live count and status indicators.
 */
import React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { PulseHeaderProps } from "./types";

export const PulseHeader = React.memo(({ recentCount }: PulseHeaderProps) => (
  <CardHeader className="px-4 pt-4 pb-0">
    <div className="flex items-baseline justify-between gap-2">
      <CardTitle className="flex items-center gap-2 text-sm font-bold">
        <div className="relative flex h-2 w-2">
          <span className="animate-ripple absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
        <span>Real-time Pulse</span>
        {recentCount !== undefined && (
          <span className="ml-2 text-lg font-black tabular-nums tracking-tighter text-primary">
            {formatNumber(recentCount)}
          </span>
        )}
      </CardTitle>
    </div>
    <CardDescription className="text-[10px] uppercase tracking-wider font-medium opacity-70">
      Live impressions (60s)
    </CardDescription>
  </CardHeader>
));

PulseHeader.displayName = "PulseHeader";
