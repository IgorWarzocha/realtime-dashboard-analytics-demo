/**
 * src/components/ui/sidebar/menu/SidebarMenuItem.tsx
 * List item wrapper for a single sidebar menu entry.
 * Acts as a positioning context for menu buttons, actions, and badges.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}
