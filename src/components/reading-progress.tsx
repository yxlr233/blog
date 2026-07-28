"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".prose");
    const indicator = indicatorRef.current;
    if (!article || !indicator) return;

    let articleTop = 0;
    let articleDistance = 1;
    let updateFrame = 0;
    let measureFrame = 0;
    const animation = indicator.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 1, fill: "both" }
    );
    animation.pause();

    const update = () => {
      updateFrame = 0;
      const start = articleTop - window.innerHeight * 0.18;
      const value = Math.min(Math.max((window.scrollY - start) / articleDistance, 0), 1);
      animation.currentTime = value;
    };

    const requestUpdate = () => {
      if (!updateFrame) updateFrame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      measureFrame = 0;
      const rect = article.getBoundingClientRect();
      articleTop = window.scrollY + rect.top;
      articleDistance = Math.max(rect.height - window.innerHeight * 0.55, 1);
      requestUpdate();
    };

    const requestMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(requestMeasure)
      : null;

    resizeObserver?.observe(article);
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
      animation.cancel();
    };
  }, []);

  return <div className="reading-progress" aria-hidden="true"><span ref={indicatorRef} /></div>;
}
