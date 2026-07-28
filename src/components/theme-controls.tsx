"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, SunMoon } from "lucide-react";

type ThemeMode = "system" | "light" | "dark";

const themeStorageKey = "quiet-notes-theme";
const modes: Array<{ value: ThemeMode; label: string; icon: typeof Monitor }> = [
  { value: "system", label: "跟随系统", icon: Monitor },
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon }
];

type ThemeControlsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ThemeControls({ open, onOpenChange }: ThemeControlsProps) {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
    window.localStorage.removeItem("quiet-notes-accent");

    if (savedMode === "system" || savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const resolvedMode = mode === "system" ? (media.matches ? "dark" : "light") : mode;
      document.documentElement.dataset.theme = resolvedMode;
      window.localStorage.setItem(themeStorageKey, mode);
    }

    apply();
    media.addEventListener("change", apply);

    return () => media.removeEventListener("change", apply);
  }, [mode]);

  return (
    <div className="theme-controls">
      <button
        aria-controls="theme-settings"
        aria-expanded={open}
        aria-label="明暗模式"
        className="icon-button"
        onClick={() => onOpenChange(!open)}
        title="明暗模式"
        type="button"
      >
        <SunMoon size={18} aria-hidden="true" />
      </button>

      {open ? (
        <div className="theme-popover" id="theme-settings">
          <div className="theme-section">
            <span className="theme-label">外观</span>
            <div className="segmented-control" role="group" aria-label="选择主题">
              {modes.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    aria-pressed={mode === item.value}
                    key={item.value}
                    onClick={() => setMode(item.value)}
                    title={item.label}
                    type="button"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
