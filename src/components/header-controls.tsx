"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavLinks, type NavItem } from "@/components/nav-links";
import { ThemeControls } from "@/components/theme-controls";

type OpenPanel = "navigation" | "theme" | null;

export function HeaderControls({ links }: { links: NavItem[] }) {
  const pathname = usePathname();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);

  useEffect(() => {
    setOpenPanel(null);
  }, [pathname]);

  useEffect(() => {
    if (!openPanel) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPanel(null);
    };
    const closeOutside = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest(".nav")) setOpenPanel(null);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [openPanel]);

  return (
    <>
      <NavLinks
        links={links}
        open={openPanel === "navigation"}
        onOpenChange={(open) => setOpenPanel(open ? "navigation" : null)}
        pathname={pathname}
      />
      <div className="nav-right">
        <ThemeControls
          open={openPanel === "theme"}
          onOpenChange={(open) => setOpenPanel(open ? "theme" : null)}
        />
      </div>
    </>
  );
}
