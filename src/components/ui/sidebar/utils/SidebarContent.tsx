/**
 * src/components/ui/sidebar/utils/SidebarContent.tsx
 * Main content container for the sidebar.
 * Automatically handles scrolling and maintains consistency between desktop and mobile.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}
