"use client";

import { Menu, X } from "lucide-react";
import { RouteLink } from "@/components/route-link";

export type NavItem = { href: string; label: string };

type NavLinksProps = {
  links: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
};

export function NavLinks({ links, open, onOpenChange, pathname }: NavLinksProps) {
  return (
    <>
      <button
        aria-controls="primary-navigation"
        aria-expanded={open}
        aria-label={open ? "关闭主导航" : "打开主导航"}
        className="nav-menu-toggle"
        onClick={() => onOpenChange(!open)}
        title={open ? "关闭主导航" : "打开主导航"}
        type="button"
      >
        {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
      </button>
      <div id="primary-navigation" className={`nav-links${open ? " is-open" : ""}`} role="list">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <RouteLink
              key={link.href}
              href={link.href}
              className={`nav-link${active ? " active" : ""}`}
              onClick={() => onOpenChange(false)}
              role="listitem"
            >
              {link.label}
            </RouteLink>
          );
        })}
      </div>
    </>
  );
}
