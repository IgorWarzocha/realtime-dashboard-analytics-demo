/**
 * BrandPerformanceTable component renders a detailed breakdown of brand metrics.
 * It filters the displayed brands based on the customerId search parameter in the URL.
 * This allows for deep-diving into specific customer portfolios.
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/format";
import { ChevronRight, ChevronDown } from "lucide-react";
import React, { useState } from "react";

export function BrandPerformanceTable() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId") as Id<"customers"> | null;
  const [expandedCustomers, setExpandedCustomers] = useState<
    Record<string, boolean>
  >({});

  const brands = useQuery(api.analytics.getBrandPerformance, {
    customerId: customerId ?? undefined,
  });

  const toggleCustomer = (cId: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [cId]: !prev[cId],
    }));
  };

  const groupedBrands = brands?.reduce(
    (acc, brand) => {
      if (!acc[brand.customerId]) {
        acc[brand.customerId] = {
          name: brand.customerName,
          brands: [],
        };
      }
      acc[brand.customerId].brands.push(brand);
      return acc;
    },
    {} as Record<string, { name: string; brands: any[] }>,
  );

  return (
    <Card className="shadow-soft border-none overflow-hidden">
      <CardHeader className="border-b bg-muted/20 px-6 py-4">
        <CardTitle className="text-base font-bold text-foreground/80">
          Brand Performance
        </CardTitle>
        <CardDescription className="text-xs">
          Performance breakdown by customer.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/5 hover:bg-muted/5 border-none">
              <TableHead className="px-6 h-10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Entity
              </TableHead>
              <TableHead className="h-10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Reach
              </TableHead>
              <TableHead className="h-10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Spend
              </TableHead>
              <TableHead className="px-6 h-10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                ROI
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands === undefined ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-3 text-right">
                    <Skeleton className="h-6 w-12 ml-auto rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-xs text-muted-foreground"
                >
                  No brand data available.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedBrands || {}).map(([cId, group]) => {
                const isExpanded = expandedCustomers[cId] ?? true;
                return (
                  <React.Fragment key={cId}>
                    <TableRow
                      className="bg-muted/5 hover:bg-muted/10 cursor-pointer transition-colors border-none"
                      onClick={() => toggleCustomer(cId)}
                    >
                      <TableCell className="px-6 py-2.5 font-bold text-xs flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        {group.name}
                        <span className="ml-1 text-[10px] font-medium text-muted-foreground/60">
                          ({group.brands.length})
                        </span>
                      </TableCell>
                      <TableCell colSpan={3} />
                    </TableRow>
                    {isExpanded &&
                      [...group.brands]
                        .sort((a, b) => b.reach - a.reach)
                        .map((brand, idx) => (
                          <TableRow
                            key={brand.brandId}
                            className="hover:bg-muted/5 transition-colors border-none"
                          >
                            <TableCell className="pl-12 pr-6 py-2 text-xs font-medium text-foreground/70 flex items-center gap-2">
                              <span className="flex items-center justify-center h-4 w-7 rounded bg-muted/30 text-[9px] font-bold text-muted-foreground shrink-0">
                                #{idx + 1}
                              </span>
                              {brand.name}
                            </TableCell>
                            <TableCell className="py-2 text-[11px] text-muted-foreground font-medium">
                              {formatNumber(brand.reach)}
                            </TableCell>
                            <TableCell className="py-2 text-[11px] text-muted-foreground font-medium">
                              {formatCurrency(brand.spend)}
                            </TableCell>
                            <TableCell className="px-6 py-2 text-right">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {brand.roi.toFixed(1)}x
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
