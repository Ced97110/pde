import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

export const ROLL_EASE = "roll";

// Faint rather than invisible, so a section never looks empty before its reveal starts.
const UNREVEALED_OPACITY = 0.12;

// Curve fitted on the reference hover samples, shared by the site's motion.
export function ensureRollEase(): void {
  gsap.registerPlugin(CustomEase);
  if (!CustomEase.get(ROLL_EASE)) CustomEase.create(ROLL_EASE, "M0,0 C0.52,0 0,1 1,1");
}

// Words appear one after another, tied to the scroll. Shared by the manifesto and the section titles.
export function revealWords(words: string, scroll: { trigger: Element; start: string; end: string }): void {
  gsap.fromTo(
    words,
    { opacity: UNREVEALED_OPACITY },
    { opacity: 1, duration: 1, stagger: 1, ease: "none", scrollTrigger: { ...scroll, scrub: true } },
  );
}
