import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <div className="back-link-row">
      <Link href={href} className="back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        {children}
      </Link>
    </div>
  );
}
