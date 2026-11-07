"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Plays once for each [data-reveal] element; `photo` wipes open, anything else rises.
export function ScrollReveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        const trigger = { trigger: element, start: "top 86%", once: true };

        if (element.dataset.reveal === "photo") {
          gsap.from(element, {
            clipPath: "inset(0 100% 0 0)",
            duration: 0.8,
            ease: "power3.out",
            clearProps: "clipPath",
            scrollTrigger: trigger,
          });
        } else {
          gsap.from(element, {
            y: 20,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: trigger,
          });
        }
      });
    });

    return () => media.revert();
  }, []);

  return null;
}
