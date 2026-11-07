"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ensureRollEase, ROLL_EASE } from "@/lib/motion";

// Early enough that the header never crosses the hero text on its way out.
const HEADER_SOLID_AT = "bottom 40%";

const HEADER = "body > header";
const BOOK_BUTTON = ".hero-book";

function revealTitle(title: HTMLElement): SplitText {
  return SplitText.create(title, { type: "words,chars" });
}

function revealChars(split: SplitText) {
  return { targets: split.chars, vars: { y: "0.5em", autoAlpha: 0, duration: 0.8, stagger: { amount: 0.5 } } };
}

// The title opens at the centre of the screen as the photos open.
function playIntro(onDone: () => void): SplitText | null {
  const title = document.querySelector<HTMLElement>(".hero-title");
  if (!title) return null;
  const split = revealTitle(title);
  gsap.set(".hero-media", { clipPath: "inset(50% 50% round 32px)" });
  gsap.set([HEADER, BOOK_BUTTON], { autoAlpha: 0 });
  delete document.documentElement.dataset.heroIntro;

  const chars = revealChars(split);
  gsap
    .timeline({
      defaults: { ease: ROLL_EASE },
      onComplete: () => {
        split.revert();
        gsap.set([".hero-media", HEADER, BOOK_BUTTON], { clearProps: "all" });
        onDone();
      },
    })
    .from(chars.targets, chars.vars, 0)
    .to(".hero-media", { clipPath: "inset(0% 0% round 0px)", duration: 0.8 }, 1.4)
    .to([HEADER, BOOK_BUTTON], { autoAlpha: 1, duration: 0.4, ease: "none" }, 1.8);

  return split;
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
