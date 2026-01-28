/**
 * src/components/ui/sidebar/utils/SidebarHeader.tsx
 * Header container for the sidebar.
 * Typically used for branding or top-level navigation actions.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}
