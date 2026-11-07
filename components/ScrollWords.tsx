"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealWords } from "@/lib/motion";

interface ScrollWordsProps {
  text: string;
  className?: string;
}

// A section title whose words appear one by one with the scroll, like the manifesto.
export function ScrollWords({ text, className }: ScrollWordsProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => revealWords(".reveal-word", { trigger: root, start: "top 90%", end: "top 50%" }),
      root,
    );

    return () => media.revert();
  }, []);

  return (
    <h2 ref={rootRef} className={className}>
      {text.split(" ").map((word, index) => (
        <Fragment key={index}>
          <span className="reveal-word">{word}</span>{" "}
        </Fragment>
      ))}
    </h2>
  );
}
