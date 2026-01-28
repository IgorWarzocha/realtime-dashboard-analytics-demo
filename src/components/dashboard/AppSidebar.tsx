/**
 * src/components/dashboard/AppSidebar.tsx
 * Primary navigation sidebar for the Dasher dashboard.
 * Orchestrates filtering state via URL parameters and renders modular sidebar groups.
 */

"use client";

import { LayoutDashboard, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarCustomerGroup } from "./Sidebar/SidebarCustomerGroup";
import { TenantManager } from "./Sidebar/TenantManager";

export function AppSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCustomerId = searchParams.get("customerId");
  const currentBrandId = searchParams.get("brandId");

  const customers = useQuery(api.analytics.listCustomers);
  const brands = useQuery(api.analytics.listBrands);

  const updateFilters = (type: "customerId" | "brandId", id: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (!id) {
      newParams.delete("customerId");
      newParams.delete("brandId");
    } else if (type === "customerId") {
      newParams.set("customerId", id);
      newParams.delete("brandId");
    } else {
      newParams.set("brandId", id);
      const brand = brands?.find((b) => b._id === id);
      if (brand) newParams.set("customerId", brand.customerId);
    }
    setSearchParams(newParams);
  };

  const isAllDataActive = !currentCustomerId && !currentBrandId;

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-3 font-black text-primary italic tracking-tighter text-xl">
          <div className="bg-primary text-white p-1 rounded-md not-italic">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">DASHER</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isAllDataActive}
                  tooltip="Dashboard"
                  onClick={() => updateFilters("customerId", null)}
                  className={cn(
                    "h-11 px-3 rounded-lg transition-all duration-200",
                    isAllDataActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <LayoutDashboard
                    className={cn(
                      "h-5 w-5",
                      isAllDataActive
                        ? "text-primary-foreground"
                        : "text-sidebar-foreground/60",
                    )}
                  />
                  <span className="font-semibold">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2 px-3">
            <TenantManager />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30">
            Customers & Brands
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {customers?.map((customer) => (
                <SidebarCustomerGroup
                  key={customer._id}
                  customer={customer}
                  brands={
                    brands?.filter((b) => b.customerId === customer._id) ?? []
                  }
                  currentCustomerId={currentCustomerId}
                  currentBrandId={currentBrandId}
                  onSelectCustomer={(id) => updateFilters("customerId", id)}
                  onSelectBrand={(id) => updateFilters("brandId", id)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-6 bg-sidebar-accent/30">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
            IW
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              Igor W.
            </span>
            <span className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest">
              Enterprise Admin
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
