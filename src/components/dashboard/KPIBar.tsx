/**
 * KPIBar
 * Top-level key performance indicators showing global campaign statistics.
 */

"use client";

import {
  LayoutDashboard,
  MousePointer2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/format";

export function KPIBar() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId") as Id<"customers"> | null;
  const brandId = searchParams.get("brandId") as Id<"brands"> | null;

  const stats = useQuery(api.analytics.getGlobalStats, {
    customerId: customerId ?? undefined,
    brandId: brandId ?? undefined,
  });

  const metrics = [
    {
      title: "Total Impressions",
      value: stats?.totalImpressions
        ? formatNumber(stats.totalImpressions)
        : "0",
      change: "+12.5%",
      icon: Users,
      loading: stats === undefined,
    },
    {
      title: "Avg. CTR",
      value: stats?.avgCtr ? formatPercent(stats.avgCtr) : "0.00%",
      change: "+0.8%",
      icon: MousePointer2,
      loading: stats === undefined,
    },
    {
      title: "Total Ads",
      value: stats?.uniqueAds ? formatNumber(stats.uniqueAds) : "0",
      change: "+2",
      icon: LayoutDashboard,
      loading: stats === undefined,
    },
    {
      title: "Conv. Rate",
      value: "3.15%",
      change: "-0.4%",
      icon: TrendingUp,
      loading: false,
    },
  ];

  return (
    <div
      data-slot="kpi-bar"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          data-slot="kpi-card"
          className="border-none shadow-enterprise overflow-hidden group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
              {metric.title}
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <metric.icon className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {metric.loading ? (
              <Skeleton
                className="h-7 w-20"
                aria-label={`Loading ${metric.title}`}
              />
            ) : (
              <div
                className="text-2xl font-extrabold tracking-tight text-shadow-sm text-shadow-primary/10"
                aria-live="polite"
              >
                {metric.value}
              </div>
            )}
            <p className="mt-1.5 text-[10px] font-semibold">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 inline-flex items-center",
                  metric.change.startsWith("+")
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {metric.change}
              </span>{" "}
              <span className="text-muted-foreground/60 ml-1">vs prev</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
