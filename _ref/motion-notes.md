# Casa Momo - measured motion notes (desktop 1440x900, 2026-11-06)

Sources: motion-sheet/, motion-desktop.webm, probes/ (read-only DOM sampling with hover and wheel only).
Times are from page start in one headless run; they vary with load speed.

## Tokens
- Display font: EL PACRE Regular. Text font: Lay Grotesk Regular.
- #0E1201 background, #FFF0CA cream, #BC6F45 terracotta footer.
- Bands report rgb(145,139,111), rgb(229,216,180), rgb(150,67,23): unverified, probably mid-transition of the page "Color Change" layer.

## Title intro
- 8 separate glyphs. Each: opacity 0 -> 1 and rise of about 85px, about 0.8s, starting near 1.0s.
- CASA first, left to right; MOMO follows 200ms later.
- Hold until about 2.1s.
- Horizontal split, about 2.1s -> 3.25s: CASA -120px, MOMO +120px, fastest near 2.5s.
- Vertical split, about 3.3s -> 4.8s: CASA to y=12, MOMO to y=678, fastest near 4.0s.
- Video seen through a rounded mask near 4.4s, full bleed near 4.8s (video frames only; mask element not identified).

## Photos
- Apartment grid (666px wide): parallax only, no opacity/clip/filter from card top = 670px onward.
  Left card translateY +35 -> -53, right +22 -> -36, about 0.05-0.07px per scrolled px, then clamped.
  Entry below 670px not sampled.
- Arch image at y=7607: clip-path path() morphs to a plain rectangle over about 400px of scroll,
  parallax -70 -> +49, opacity falls to 0.67 as it leaves the top. Driven by scroll.

## Hover: rolling label ([data-rolling-label], code component)
- Label: inline-block, overflow hidden. Accessible text in a visually hidden span.
- Each letter (aria-hidden): relative inline-block slot with 3 spans: visibility hidden spacer,
  absolute copy at 0, absolute copy at translateY(100%).
- Hover in: copy 1 -> -100%, copy 2 -> 0, about 0.6s, strong ease-out, left to right, about 10ms per letter.
- Hover out: reverses, about 0.6s, also left to right, about 8ms per letter.
- Exact easing not fitted.
