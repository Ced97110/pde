"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Travel measured on the reference; .unit-card-media overflows its frame by these amounts.
const PARALLAX_START_Y = 35;
const PARALLAX_END_Y = -53;

export function UnitParallax() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      gsap.utils.toArray<HTMLElement>(".units-grid .unit-card-frame").forEach((frame) => {
        gsap.fromTo(
          frame.querySelector(".unit-card-media"),
          { y: PARALLAX_START_Y },
          {
            y: PARALLAX_END_Y,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    return () => media.revert();
  }, []);

  return null;
}
