/**
 * src/components/ui/sidebar/menu/SidebarMenu.tsx
 * Unordered list container for sidebar menu items.
 * Provides consistent vertical spacing and layout for navigation links.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}
