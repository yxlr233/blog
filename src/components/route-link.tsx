"use client";

import NextLink, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import type { ComponentProps } from "react";

type RouteLinkProps = ComponentProps<typeof NextLink>;

export function RouteLink({ children, ...props }: RouteLinkProps) {
  return (
    <NextLink {...props}>
      {children}
      <RoutePendingIndicator />
    </NextLink>
  );
}

function RoutePendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending || typeof document === "undefined") return null;

  return createPortal(
    <span className="route-progress" aria-label="页面加载中" role="status">
      <span className="route-progress-bar" aria-hidden="true" />
    </span>,
    document.body
  );
}
