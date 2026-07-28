import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { RouteLink } from "@/components/route-link";

export function BackLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <div className="back-link-row">
      <RouteLink href={href} className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        {children}
      </RouteLink>
    </div>
  );
}
