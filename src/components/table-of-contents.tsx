"use client";

import { useEffect, useState } from "react";

type TableOfContentsHeading = {
  id: string;
  text: string;
  depth: number;
};

export function TableOfContents({ headings }: { headings: TableOfContentsHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".prose");
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    let offsets: number[] = [];
    let updateFrame = 0;
    let measureFrame = 0;

    const update = () => {
      updateFrame = 0;
      if (!elements.length) return;

      const scrollPosition = window.scrollY + 150;
      let low = 0;
      let high = offsets.length - 1;
      let activeIndex = 0;

      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (offsets[middle] <= scrollPosition) {
          activeIndex = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }

      setActiveId(elements[activeIndex]?.id ?? headings[0]?.id ?? "");
    };

    const requestUpdate = () => {
      if (!updateFrame) updateFrame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      measureFrame = 0;
      offsets = elements.map((heading) => window.scrollY + heading.getBoundingClientRect().top);
      requestUpdate();
    };

    const requestMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const resizeObserver = article && "ResizeObserver" in window
      ? new ResizeObserver(requestMeasure)
      : null;

    if (article) resizeObserver?.observe(article);
    measure();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("load", requestMeasure, { once: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("load", requestMeasure);
      if (updateFrame) window.cancelAnimationFrame(updateFrame);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
    };
  }, [headings]);

  return (
    <aside className="toc" aria-label="文章目录">
      <p className="toc-title">本页目录</p>
      <ul className="toc-list">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id} className={`depth-${heading.depth}`}>
              <a
                href={`#${heading.id}`}
                className={active ? "is-active" : undefined}
                aria-current={active ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
