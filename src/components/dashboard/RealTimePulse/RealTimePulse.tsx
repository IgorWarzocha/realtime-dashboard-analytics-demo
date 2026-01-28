"use client";

import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RealTimePulseProps } from "./types";
import { PulseHeader } from "./PulseHeader";
import { LiveChart } from "./LiveChart";

export function RealTimePulse({ className }: RealTimePulseProps) {
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId") as Id<"brands"> | null;

  const recentCount = useQuery(api.analytics.getRecentImpressionsCount, {
    lastXSeconds: 60,
    brandId: brandId ?? undefined,
  });

  const pulseData = useQuery(api.analytics.getPulseSeries, {
    brandId: brandId ?? undefined,
  });

  return (
    <Card
      data-slot="pulse-chart"
      className={cn("overflow-hidden relative flex flex-col", className)}
    >
      <PulseHeader recentCount={recentCount} />
      <CardContent className="px-0 pb-0 flex-1 min-h-[120px] relative">
        {pulseData === undefined ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Skeleton className="h-full w-full opacity-50" />
          </div>
        ) : (
          <LiveChart pulseData={pulseData} />
        )}
      </CardContent>
    </Card>
  );
}
