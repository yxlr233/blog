"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { site } from "@/lib/site";

type ThemeMode = "system" | "light" | "dark";

const themeStorageKey = "quiet-notes-theme";
const accentStorageKey = "quiet-notes-accent";
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
  const [accent, setAccent] = useState(site.theme.accents[0].value);

  const selectedAccent = useMemo(
    () => site.theme.accents.find((item) => item.value === accent) ?? site.theme.accents[0],
    [accent]
  );

  useEffect(() => {
    const savedMode = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
    const savedAccent = window.localStorage.getItem(accentStorageKey);

    if (savedMode === "system" || savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
    }

    if (savedAccent && site.theme.accents.some((item) => item.value === savedAccent)) {
      setAccent(savedAccent);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const resolvedMode = mode === "system" ? (media.matches ? "dark" : "light") : mode;
      document.documentElement.dataset.theme = resolvedMode;
      document.documentElement.style.setProperty("--accent", selectedAccent.value);
      window.localStorage.setItem(themeStorageKey, mode);
      window.localStorage.setItem(accentStorageKey, selectedAccent.value);
    }

    apply();
    media.addEventListener("change", apply);

    return () => media.removeEventListener("change", apply);
  }, [mode, selectedAccent]);

  return (
    <div className="theme-controls">
      <button
        aria-controls="theme-settings"
        aria-expanded={open}
        aria-label="界面设置"
        className="icon-button"
        onClick={() => onOpenChange(!open)}
        title="界面设置"
        type="button"
      >
        <Palette size={18} aria-hidden="true" />
      </button>

      {open ? (
        <div className="theme-popover" id="theme-settings">
          <div className="theme-section">
            <span className="theme-label">主题</span>
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
          <div className="theme-section">
            <span className="theme-label">强调色</span>
            <div className="swatch-row" role="group" aria-label="选择强调色">
              {site.theme.accents.map((item) => (
                <button
                  aria-label={item.name}
                  aria-pressed={selectedAccent.value === item.value}
                  className="color-swatch"
                  key={item.value}
                  onClick={() => setAccent(item.value)}
                  style={{ backgroundColor: item.value }}
                  title={item.name}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
