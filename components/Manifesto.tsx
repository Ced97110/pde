"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealWords } from "@/lib/motion";


// Each picture comes in from its side of the screen, tied to the scroll.
const PICTURES = [
  { selector: ".manifesto-shell", fromX: 170, rotation: 35, start: "top 85%", end: "top 30%" },
  { selector: ".manifesto-star", fromX: -170, rotation: -50, start: "top 50%", end: "top 0%" },
];

interface ManifestoProps {
  text: string;
}

export function Manifesto({ text }: ManifestoProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      revealWords(".reveal-word", { trigger: root, start: "top 65%", end: "bottom 60%" });

      PICTURES.forEach(({ selector, fromX, rotation, start, end }) => {
        gsap.fromTo(
          selector,
          { xPercent: fromX, rotation, scale: 0.8 },
          {
            xPercent: 0,
            rotation: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root, start, end, scrub: true },
          },
        );
      });
    }, root);

    return () => media.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="manifesto relative z-[1] flex bg-background items-center justify-center overflow-hidden px-[var(--page-margin)]"
    >
      <div className="manifesto-shell manifesto-picture" aria-hidden="true">
        <Image src="/images/decor/coquillage.webp" alt="" width={808} height={586} sizes="(min-width: 768px) 20vw, 30vw" />
      </div>
      <div className="manifesto-star manifesto-picture" aria-hidden="true">
        <Image src="/images/decor/etoile-de-mer.webp" alt="" width={871} height={846} sizes="(min-width: 768px) 20vw, 30vw" />
      </div>
      <p className="relative max-w-[48rem] text-center">
        {text.split(" ").map((word, index) => (
          <Fragment key={index}>
            <span className="manifesto-word reveal-word">{word}</span>{" "}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
