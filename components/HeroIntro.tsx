"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ensureRollEase, ROLL_EASE } from "@/lib/motion";

// Early enough that the header never crosses the hero text on its way out.
const HEADER_SOLID_AT = "bottom 40%";

// The title opens at the centre of the screen, then settles at the bottom as the video opens.
function playIntro(onDone: () => void): SplitText | null {
  const title = document.querySelector<HTMLElement>(".hero-title");
  if (!title) return null;

  const box = title.getBoundingClientRect();
  const fadeTargets = ["body > header"];
  const split = SplitText.create(title, { type: "words,chars" });

  gsap.set(title, { y: (window.innerHeight - box.height) / 2 - box.top });
  gsap.set(".hero", { backgroundImage: "none" });
  gsap.set(".hero-media", { clipPath: "inset(50% 50% round 32px)" });
  gsap.set(fadeTargets, { autoAlpha: 0 });
  delete document.documentElement.dataset.heroIntro;

  gsap
    .timeline({
      defaults: { ease: ROLL_EASE },
      onComplete: () => {
        split.revert();
        gsap.set([title, ".hero", ".hero-media", ...fadeTargets], { clearProps: "all" });
        onDone();
      },
    })
    .from(split.chars, { y: "0.5em", autoAlpha: 0, duration: 0.8, stagger: { amount: 0.5 } }, 0)
    .to(title, { y: 0, duration: 0.8 }, 1.4)
    .to(".hero-media", { clipPath: "inset(0% 0% round 0px)", duration: 0.8 }, 1.4)
    .to(fadeTargets, { autoAlpha: 1, duration: 0.4, ease: "none" }, 1.8);

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
