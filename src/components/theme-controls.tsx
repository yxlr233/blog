"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun, SunMoon } from "lucide-react";

type ThemeMode = "system" | "light" | "dark";

const themeStorageKey = "quiet-notes-theme";
const themeChangeEvent = "quiet-notes-theme-change";
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
  const mode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function apply() {
      const resolvedMode = mode === "system" ? (media.matches ? "dark" : "light") : mode;
      document.documentElement.dataset.theme = resolvedMode;
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
                    onClick={() => setTheme(item.value)}
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

function getThemeSnapshot(): ThemeMode {
  const savedMode = window.localStorage.getItem(themeStorageKey);
  return savedMode === "light" || savedMode === "dark" ? savedMode : "system";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(themeChangeEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(themeChangeEvent, onChange);
  };
}

function setTheme(mode: ThemeMode) {
  window.localStorage.setItem(themeStorageKey, mode);
  window.dispatchEvent(new Event(themeChangeEvent));
}
