/**
 * src/components/ui/sidebar/utils/SidebarFooter.tsx
 * Footer container for the sidebar.
 * Typically used for user profiles, settings, or secondary navigation links.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}
