/**
 * src/components/ui/sidebar/menu/SidebarMenuSubItem.tsx
 * List item wrapper for nested sidebar menu entries.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}
