"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ensureRollEase, ROLL_EASE } from "@/lib/motion";

// Early enough that the header never crosses the hero text on its way out.
const HEADER_SOLID_AT = "bottom 40%";

const WIDE_SCREEN = "(min-width: 1024px)";
const HEADER = "body > header";

function revealTitle(title: HTMLElement): SplitText {
  return SplitText.create(title, { type: "words,chars" });
}

function revealChars(split: SplitText) {
  return { targets: split.chars, vars: { y: "0.5em", autoAlpha: 0, duration: 0.8, stagger: { amount: 0.5 } } };
}

// The white panel fills the hero, then opens into its frame as the pictures rise and the title appears.
function playFramedIntro(title: HTMLElement, onDone: () => void): SplitText {
  const split = revealTitle(title);
  const pictures = [".hero-photo", ".hero-media"];
  gsap.set(".hero-panel", { inset: 0 });
  gsap.set(pictures, { clipPath: "inset(100% 0% 0% 0%)", y: 60 });
  gsap.set(HEADER, { autoAlpha: 0 });
  delete document.documentElement.dataset.heroIntro;

  const chars = revealChars(split);
  gsap
    .timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        split.revert();
        gsap.set([".hero-panel", ...pictures, HEADER], { clearProps: "all" });
        onDone();
      },
    })
    .from(chars.targets, chars.vars, 0.2)
    .to(pictures, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.6, stagger: 0.25 }, 0.3)
    .to(".hero-panel", { inset: "var(--hero-frame)", duration: 1.8 }, 0.6)
    .to(HEADER, { autoAlpha: 1, duration: 0.6, ease: "none" }, 1.2);

  return split;
}

// The title opens at the centre of the screen as the video opens.
function playFullScreenIntro(title: HTMLElement, onDone: () => void): SplitText {
  const split = revealTitle(title);
  gsap.set(".hero", { backgroundImage: "none" });
  gsap.set(".hero-media", { clipPath: "inset(50% 50% round 32px)" });
  gsap.set(HEADER, { autoAlpha: 0 });
  delete document.documentElement.dataset.heroIntro;

  const chars = revealChars(split);
  gsap
    .timeline({
      defaults: { ease: ROLL_EASE },
      onComplete: () => {
        split.revert();
        gsap.set([".hero", ".hero-media", HEADER], { clearProps: "all" });
        onDone();
      },
    })
    .from(chars.targets, chars.vars, 0)
    .to(".hero-media", { clipPath: "inset(0% 0% round 0px)", duration: 0.8 }, 1.4)
    .to(HEADER, { autoAlpha: 1, duration: 0.4, ease: "none" }, 1.8);

  return split;
}

function playIntro(onDone: () => void): SplitText | null {
  const title = document.querySelector<HTMLElement>(".hero-title");
  if (!title) return null;
  return window.matchMedia(WIDE_SCREEN).matches ? playFramedIntro(title, onDone) : playFullScreenIntro(title, onDone);
}

export function HeroIntro() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    ensureRollEase();

    const { body, documentElement: root } = document;
    body.dataset.header = "hero";
    const headerTrigger = ScrollTrigger.create({
      trigger: ".hero",
      start: HEADER_SOLID_AT,
      onEnter: () => {
        body.dataset.header = "solid";
      },
      onLeaveBack: () => {
        body.dataset.header = "hero";
      },
    });

    let cancelled = false;
    let split: SplitText | null = null;
    const context = gsap.context(() => {});

    if (root.dataset.heroIntro === "pending") {
      if (window.scrollY > 0) {
        delete root.dataset.heroIntro;
      } else {
        void document.fonts.ready.then(() => {
          if (cancelled) return;
          context.add(() => {
            split = playIntro(() => ScrollTrigger.refresh());
          });
        });
      }
    }

    return () => {
      cancelled = true;
      context.revert();
      split?.revert();
      headerTrigger.kill();
      delete body.dataset.header;
    };
  }, []);

  return null;
}
