"use client";

import { useEffect } from "react";

/**
 * Fades [data-reveal] sections in as they scroll into view.
 *
 * Content is visible in the server HTML, so the page still works without
 * JavaScript. Elements already on screen when this runs are left alone, so
 * nothing above the fold flashes visible -> hidden -> visible on load.
 */
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.07 },
    );
    const viewportHeight = window.innerHeight;
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < viewportHeight && bounds.bottom > 0) return;
      element.classList.add("will-reveal");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return null;
}
