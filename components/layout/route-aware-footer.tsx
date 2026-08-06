"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface RouteAwareFooterProps {
  fullFooter: ReactNode;
  copyrightFooter: ReactNode;
}

export function RouteAwareFooter({
  fullFooter,
  copyrightFooter,
}: RouteAwareFooterProps) {
  const pathname = usePathname();

  return pathname === "/" ? fullFooter : copyrightFooter;
}
