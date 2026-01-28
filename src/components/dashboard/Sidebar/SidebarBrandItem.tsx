/**
 * src/components/dashboard/Sidebar/SidebarBrandItem.tsx
 * Renders a single brand item within the sidebar's customer list.
 * Manages active state and navigation via URL search parameters.
 */

import { Tag } from "lucide-react";
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarBrandItemProps {
  brand: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function SidebarBrandItem({
  brand,
  isActive,
  onSelect,
}: SidebarBrandItemProps) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={isActive}
        onClick={(e) => {
          e.preventDefault();
          onSelect(brand._id);
        }}
        className={cn(
          "transition-all duration-200 cursor-pointer",
          isActive
            ? "text-primary font-bold"
            : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
        )}
      >
        <Tag className="h-4 w-4 mr-2" />
        <span>{brand.name}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
