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

    targets.forEach((target) => target.classList.add("reveal-item"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const article = document.querySelector<HTMLElement>(".prose");
    const progress = document.querySelector<HTMLElement>(".reading-progress > span");
    const headings = Array.from(document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]"));
    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc-list a[href^='#']"));
    const needsMeasure = Boolean(article || headings.length || tocLinks.length);
    const copyTimers = new Map<HTMLButtonElement, number>();
    let articleTop = 0;
    let articleDistance = 1;
    let headingOffsets: number[] = [];
    let activeId = "";
    let updateFrame = 0;
    let measureFrame = 0;

    const updateActiveHeading = (scrollPosition: number) => {
      if (!headings.length || !tocLinks.length) return;

      let low = 0;
      let high = headingOffsets.length - 1;
      let activeIndex = 0;

      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (headingOffsets[middle] <= scrollPosition + 150) {
          activeIndex = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }

      const nextId = headings[activeIndex]?.id ?? "";
      if (!nextId || nextId === activeId) return;
      activeId = nextId;

      tocLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const update = () => {
      updateFrame = 0;
      const scrollPosition = window.scrollY;
      header?.classList.toggle("is-scrolled", scrollPosition > 12);

      if (progress && article) {
        const start = articleTop - window.innerHeight * 0.18;
        const value = Math.min(Math.max((scrollPosition - start) / articleDistance, 0), 1);
        progress.style.transform = `scaleX(${value})`;
      }

      updateActiveHeading(scrollPosition);
    };

    const requestUpdate = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      measureFrame = 0;
      if (article) {
        const rect = article.getBoundingClientRect();
        articleTop = window.scrollY + rect.top;
        articleDistance = Math.max(rect.height - window.innerHeight * 0.55, 1);
      }
      headingOffsets = headings.map((heading) => window.scrollY + heading.getBoundingClientRect().top);
      requestUpdate();
    };

    const requestMeasure = () => {
      if (measureFrame) return;
      measureFrame = window.requestAnimationFrame(measure);
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
      requestMeasure();
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

    const resizeObserver = article && "ResizeObserver" in window
      ? new ResizeObserver(requestMeasure)
      : null;

    if (resizeObserver && article) resizeObserver.observe(article);
    measure();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    if (needsMeasure) {
      window.addEventListener("resize", requestMeasure);
      window.addEventListener("load", requestMeasure, { once: true });
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      if (needsMeasure) {
        window.removeEventListener("resize", requestMeasure);
        window.removeEventListener("load", requestMeasure);
      }
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      copyTimers.forEach((timer) => window.clearTimeout(timer));
      if (updateFrame) window.cancelAnimationFrame(updateFrame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
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
