"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  ".intro-copy > *",
  ".intro-index",
  ".section-heading",
  ".post-card",
  ".taxonomy-card",
  ".page-header > *",
  ".custom-page-header > *",
  ".profile-card",
  ".about-section",
  ".post-header > *",
  ".toc",
  ".prose > h2",
  ".prose > h3",
  ".prose > figure",
  ".prose > .callout",
  ".prose > .mdx-card-grid",
  ".prose > .mdx-tabs",
  ".prose > .table-scroll"
].join(",");

export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window) || !("animate" in Element.prototype)) {
      return;
    }

    const rootStyles = window.getComputedStyle(document.documentElement);
    const duration = Number.parseFloat(rootStyles.getPropertyValue("--motion-slow")) || 480;
    const easing = rootStyles.getPropertyValue("--ease-out").trim();
    const animations: Animation[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          const parent = target.parentElement;
          const staggered = parent?.matches(".post-list, .taxonomy-grid") ?? false;
          const siblingIndex = parent ? Array.from(parent.children).indexOf(target) : 0;
          const delay = staggered ? Math.min(Math.max(siblingIndex, 0) * 30, 60) : 0;

          animations.push(target.animate(
            [
              { opacity: 0, translate: "0 10px" },
              { opacity: 1, translate: "0 0" }
            ],
            { duration, delay, easing, fill: "backwards" }
          ));
          observer.unobserve(target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const copyTimers = new Map<HTMLButtonElement, number>();
    let updateFrame = 0;

    const update = () => {
      updateFrame = 0;
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    const requestUpdate = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(update);
    };

    const activateTab = (target: HTMLButtonElement, focus = false) => {
      const tabs = target.closest<HTMLElement>("[data-tabs]");
      const index = Number(target.dataset.tabIndex);
      if (!tabs || !Number.isInteger(index)) return;

      const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>("[role='tab']"));
      const panels = Array.from(tabs.querySelectorAll<HTMLElement>("[role='tabpanel']"));
      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== index;
      });
      if (focus) window.requestAnimationFrame(() => buttons[index]?.focus());
    };

    const handleClick = async (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const tab = element?.closest<HTMLButtonElement>("[role='tab'][data-tab-index]");
      if (tab) {
        activateTab(tab);
        return;
      }

      const target = element?.closest<HTMLButtonElement>("[data-copy-code]");
      if (!target) return;

      const code = target.closest(".code-block-shell")?.querySelector("code")?.textContent?.replace(/\n$/, "");
      if (!code) return;

      try {
        await copyText(code);
        const previousTimer = copyTimers.get(target);
        if (previousTimer) window.clearTimeout(previousTimer);

        target.dataset.copied = "true";
        target.setAttribute("aria-label", "代码已复制");
        target.title = "已复制";
        const timer = window.setTimeout(() => {
          target.removeAttribute("data-copied");
          target.setAttribute("aria-label", "复制代码");
          target.title = "复制代码";
          copyTimers.delete(target);
        }, 2000);
        copyTimers.set(target, timer);
      } catch {
        target.removeAttribute("data-copied");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[role='tab'][data-tab-index]")
        : null;
      if (!target) return;

      const tabs = Array.from(
        target.closest<HTMLElement>("[data-tabs]")?.querySelectorAll<HTMLButtonElement>("[role='tab']") ?? []
      );
      const currentIndex = tabs.indexOf(target);
      const lastIndex = tabs.length - 1;
      let nextIndex = currentIndex;

      if (event.key === "ArrowRight") nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      else if (event.key === "ArrowLeft") nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = lastIndex;
      else return;

      event.preventDefault();
      if (tabs[nextIndex]) activateTab(tabs[nextIndex], true);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      copyTimers.forEach((timer) => window.clearTimeout(timer));
      if (updateFrame) window.cancelAnimationFrame(updateFrame);
    };
  }, [pathname]);

  return null;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the legacy path when clipboard permission is denied.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Unable to copy code");
}
