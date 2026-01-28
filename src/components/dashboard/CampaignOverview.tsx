/**
 * CampaignOverview
 * Displays detailed metrics and performance data for a selected advertising campaign.
 */

"use client";

import React from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CampaignOverviewProps {
  className?: string;
}

const DistributionList = React.memo(
  ({
    distribution,
    total,
  }: {
    distribution: any[] | undefined;
    total: number;
  }) => {
    if (distribution === undefined) {
      return (
        <div className="space-y-3 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (distribution.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground italic">
          No live data available
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-2">
        {distribution.slice(0, 4).map((item) => (
          <div key={item.device} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">{item.device}</span>
              <span className="text-primary tabular-nums">
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
);

DistributionList.displayName = "DistributionList";

export function CampaignOverview({ className }: CampaignOverviewProps) {
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId") as Id<"brands"> | null;

  const distribution = useQuery(api.analytics.getDeviceDistribution, {
    brandId: brandId ?? undefined,
  });

  const total = distribution?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  return (
    <Card
      data-slot="campaign-overview"
      className={cn("overflow-hidden relative", className)}
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-base font-bold">Device Overview</CardTitle>
        <CardDescription className="text-xs">
          Live traffic distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <DistributionList distribution={distribution} total={total} />
      </CardContent>
    </Card>
  );
}
