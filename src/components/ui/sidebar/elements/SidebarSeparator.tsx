/**
 * src/components/ui/sidebar/elements/SidebarSeparator.tsx
 * Visual divider for sidebar sections.
 * Inherits theme-specific border colors and maintains consistent margins.
 */

"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}
