"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ensureRollEase, ROLL_EASE } from "@/lib/motion";

const ROLL_DURATION = 0.6;
const STAGGER_IN = 0.01;
const STAGGER_OUT = 0.008;

interface RollingLabelProps {
  text: string;
}

export function RollingLabel({ text }: RollingLabelProps) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const trigger = root?.closest("a, button, summary");
    if (!root || !trigger) return;

    ensureRollEase();
    const letters = root.querySelectorAll(".roll-letter");
    const roll = (yPercent: number, stagger: number) =>
      gsap.to(letters, { yPercent, stagger, duration: ROLL_DURATION, ease: ROLL_EASE, overwrite: true });
    const rollIn = () => roll(-100, STAGGER_IN);
    const rollOut = () => roll(0, STAGGER_OUT);

    const media = gsap.matchMedia();
    media.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      trigger.addEventListener("mouseenter", rollIn);
      trigger.addEventListener("mouseleave", rollOut);
      trigger.addEventListener("focusin", rollIn);
      trigger.addEventListener("focusout", rollOut);

      return () => {
        trigger.removeEventListener("mouseenter", rollIn);
        trigger.removeEventListener("mouseleave", rollOut);
        trigger.removeEventListener("focusin", rollIn);
        trigger.removeEventListener("focusout", rollOut);
      };
    });

    return () => media.revert();
  }, []);

  return (
    <span ref={rootRef} className="roll">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, index) => (
          <span key={index} className="roll-letter">
            {char}
            <span>{char}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
