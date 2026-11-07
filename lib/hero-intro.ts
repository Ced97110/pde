// Runs inline before first paint, so the title never flashes before the intro hides it.
export const HERO_INTRO_BOOTSTRAP = `try {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !sessionStorage.getItem("hero-intro-seen")) {
    sessionStorage.setItem("hero-intro-seen", "1");
    document.documentElement.dataset.heroIntro = "pending";
  }
} catch {}`;
