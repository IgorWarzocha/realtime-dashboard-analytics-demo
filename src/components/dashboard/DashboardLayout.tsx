/**
 * DashboardLayout component serves as the primary structural container for the dashboard.
 * Coordinates the sidebar, header, and grid layout for various analytical sub-components.
 */

"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { KPIBar } from "@/components/dashboard/KPIBar";
import { RealTimePulse } from "@/components/dashboard/RealTimePulse";
import { CampaignOverview } from "@/components/dashboard/CampaignOverview";
import { TopCampaigns } from "@/components/dashboard/TopCampaigns";
import { BrandPerformanceTable } from "@/components/dashboard/BrandPerformanceTable";
import { SimulationController } from "@/components/dashboard/SimulationController";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 px-6">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-bold tracking-tight text-foreground/90 mr-auto">
            Ad Analytics Dashboard
          </h1>
          <SimulationController />
        </header>
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <KPIBar />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
            <RealTimePulse className="col-span-full lg:col-span-8 shadow-soft border-none" />
            <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
              <CampaignOverview className="shadow-soft border-none" />
              <TopCampaigns className="shadow-soft border-none" />
            </div>
          </div>
          <BrandPerformanceTable />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
