"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// .beach-media overflows the bottom of the section by 15%, which covers this travel.
const COVER_TRAVEL_PERCENT = 12;

interface BeachParallaxProps {
  src: string;
  alt: string;
}

// The photo stays in place while the next section rises over it, drifting slower than that section.
export function BeachParallax({ src, alt }: BeachParallaxProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".beach-media", {
        yPercent: -COVER_TRAVEL_PERCENT,
        ease: "none",
        scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: true },
      });
    }, stage);

    return () => media.revert();
  }, []);

  return (
    <div ref={stageRef} className="beach-stage">
      <section className="beach sticky top-0 h-svh overflow-hidden">
        <div className="beach-media">
          <Image src={src} alt={alt} fill sizes="(min-width: 768px) 125vw, 300vw" className="object-cover object-[8%_50%] md:object-[30%_50%]" />
        </div>
      </section>
    </div>
  );
}
