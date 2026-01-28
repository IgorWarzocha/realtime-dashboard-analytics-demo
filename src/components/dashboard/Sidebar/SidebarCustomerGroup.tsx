/**
 * src/components/dashboard/Sidebar/SidebarCustomerGroup.tsx
 * Renders a customer and its associated brands as a collapsible group.
 * Handles state-driven expansion and selection logic for multi-tenant filtering.
 */

import { Building2, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarBrandItem } from "./SidebarBrandItem";

interface Brand {
  _id: string;
  name: string;
  customerId: string;
}

interface Customer {
  _id: string;
  name: string;
}

interface SidebarCustomerGroupProps {
  customer: Customer;
  brands: Brand[];
  currentCustomerId: string | null;
  currentBrandId: string | null;
  onSelectCustomer: (id: string) => void;
  onSelectBrand: (id: string) => void;
}

export function SidebarCustomerGroup({
  customer,
  brands,
  currentCustomerId,
  currentBrandId,
  onSelectCustomer,
  onSelectBrand,
}: SidebarCustomerGroupProps) {
  const isCustomerActive = currentCustomerId === customer._id;

  return (
    <Collapsible
      key={customer._id}
      asChild
      defaultOpen={isCustomerActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={customer.name}
            isActive={isCustomerActive && !currentBrandId}
            onClick={() => onSelectCustomer(customer._id)}
            className={cn(
              "h-11 px-3 rounded-lg transition-all duration-200",
              isCustomerActive && !currentBrandId
                ? "bg-sidebar-accent text-primary"
                : "hover:bg-sidebar-accent",
            )}
          >
            <Building2 className="h-5 w-5 text-sidebar-foreground/60" />
            <span className="font-semibold">{customer.name}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {brands.map((brand) => (
              <SidebarBrandItem
                key={brand._id}
                brand={brand}
                isActive={currentBrandId === brand._id}
                onSelect={onSelectBrand}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
