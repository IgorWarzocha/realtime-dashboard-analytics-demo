/**
 * TopCampaigns
 * Table displaying the highest-performing campaigns by click-through rate.
 */

"use client";

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
import { formatNumber, formatPercent } from "@/lib/format";
import { TrendingUp, Award } from "lucide-react";
import React from "react";
import { getCampaignColor } from "@/lib/colors";

interface TopCampaignsProps {
  className?: string;
  limit?: number;
}

const CampaignRow = React.memo(
  ({
    adName,
    brandName,
    impressions,
    ctr,
    index,
  }: {
    adId: Id<"ads">;
    adName: string;
    brandName: string;
    impressions: number;
    clicks: number;
    ctr: number;
    index: number;
  }) => (
    <div className="flex items-center gap-3 group transition-all h-[52px] border-b border-muted/5 last:border-0 px-3">
      <div
        className="flex items-center justify-center h-7 w-7 rounded-md text-[10px] font-bold shrink-0 border transition-colors"
        style={{
          backgroundColor: `${getCampaignColor(index)}15`,
          color: getCampaignColor(index),
          borderColor: `${getCampaignColor(index)}30`,
        }}
      >
        #{index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold truncate text-foreground/90 leading-tight">
          {adName}
        </div>
        <div className="text-[9px] text-muted-foreground truncate uppercase tracking-tight mt-0.5">
          {brandName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] font-black text-foreground tabular-nums leading-none">
          {formatNumber(impressions)}
        </div>
        <div className="text-[9px] text-primary font-bold tabular-nums mt-1">
          {formatPercent(ctr)}
        </div>
      </div>
    </div>
  ),
);

CampaignRow.displayName = "CampaignRow";

const CampaignList = React.memo(
  ({ campaigns, limit }: { campaigns: any[] | undefined; limit: number }) => {
    const containerHeight = limit * 52;

    return (
      <div
        className="mt-2 relative bg-card/50 rounded-xl overflow-hidden border border-border/5"
        style={{
          height: `${containerHeight}px`,
          contain: "paint layout",
        }}
      >
        {campaigns === undefined ? (
          <div className="absolute inset-0 flex flex-col">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 h-[52px] px-3 border-b border-muted/5 last:border-0"
              >
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground italic">
            No campaign data available
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col">
            {campaigns.map((campaign, idx) => (
              <CampaignRow key={campaign.adId} {...campaign} index={idx} />
            ))}
          </div>
        )}
      </div>
    );
  },
);

CampaignList.displayName = "CampaignList";

export function TopCampaigns({ className, limit = 5 }: TopCampaignsProps) {
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId") as Id<"brands"> | null;

  const campaigns = useQuery(api.analytics.getTopCampaigns, {
    brandId: brandId ?? undefined,
    limit,
  });

  return (
    <Card
      data-slot="top-campaigns"
      className={cn("overflow-hidden relative", className)}
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Top Campaigns
            </CardTitle>
            <CardDescription className="text-xs">
              Highest reach campaigns
            </CardDescription>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-6">
        <CampaignList campaigns={campaigns} limit={limit} />
      </CardContent>
    </Card>
  );
}
