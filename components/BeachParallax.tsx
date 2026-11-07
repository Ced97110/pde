"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const START_SIDE_INSET = "30%";
// .beach-media overflows the section by 15% on each side, which covers this travel.
const PARALLAX_TRAVEL_PERCENT = 10;

interface BeachParallaxProps {
  src: string;
  alt: string;
}

export function BeachParallax({ src, alt }: BeachParallaxProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 85%", end: "top 15%", scrub: 0.4 } })
        .fromTo(
          ".beach-plane",
          { clipPath: `inset(0% ${START_SIDE_INSET} 100% ${START_SIDE_INSET})` },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        )
        .set(".beach-plane", { clipPath: "none" });

      gsap.fromTo(
        ".beach-media",
        { yPercent: -PARALLAX_TRAVEL_PERCENT },
        {
          yPercent: PARALLAX_TRAVEL_PERCENT,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, root);

    return () => media.revert();
  }, []);

  return (
    <section ref={rootRef} className="beach relative h-svh overflow-hidden">
      <div className="beach-plane absolute inset-0 overflow-hidden">
        <div className="beach-media">
          <Image src={src} alt={alt} fill sizes="(min-width: 768px) 125vw, 300vw" className="object-cover object-[8%_50%] md:object-[30%_50%]" />
        </div>
      </div>
    </section>
  );
}
