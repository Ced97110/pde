# Reference capture status - https://www.casamomo.at/

Date: 2026-11-06. awwwards-mcp 1.18.0, launched through npx.

| Step | Status | Output |
|---|---|---|
| search_sites "Casa Momo" | done | site-details.md |
| get_site_details casa-momo | done, no palette or fonts (nominee) | site-details.md, awwwards-preview.png |
| analyze_stack | done | stack.json |
| capture_live_site desktop | done | capture-desktop.png |
| capture_live_site mobile | done | capture-mobile.png |
| analyze_page_structure desktop + mobile | done, not saved as a file (results in session) | motion-notes.md for tokens |
| analyze_scroll_map scrubProbe | done, only 2 CSS animations and no scrub curves (misses JS motion) | - |
| analyze_hover_census | done, 40 hover rules but 0 samples | - |
| record_site_motion desktop | done, generic sheet with 6 keyframes | motion-desktop.webm, motion-sheet/ |
| Custom DOM probes | done | motion-notes.md, probes/ |

## Section 1 (2026-11-06)
- Built: header over hero, Gloock title, GSAP intro, rolling labels. Gloock is scoped to the hero title.
- verify_build: 22/100 before and after (bands 0, motion 56). Whole-page metric, see final notes in session.
- Waiting for the user's "valide" before section 2.
- Open bug outside section 1: unit price in UnitCard overflows by 35px at 768px.

## Section 2 (2026-11-06)
- Built: Manifesto (components/Manifesto.tsx), new dictionary key home.manifesto, background F persienne to ground.
- verify_build: see session, whole-page metric. E (hero dimming) not built, to decide.
- Waiting for the user's "valide" before section 3.

## Section 3 (2026-11-06)
- Shutter mechanics kept as is. Title moved to Gloock 400, caption aligned on --page-margin.
- Waiting for the user's "valide" before section 4.
- Section 3 reworked on request: 3D scroll scene (rotating louvres, photo coming forward), track 300vh.
- Section 3 reworked on request: WebGL2 story gate, path, beach (lib/webgl), track 500vh, no new dependency.
- Black band at the bottom of the canvas appears only in Playwright Chromium, not in real Chrome. Tool artefact.

## Redesign (2026-11-06)
- Shutter removed. New palette on #8AD6D1, one type scale and one weight, no gradient, no orange, no beige.
- Licensed reference fonts replaced by Gloock and Hanken Grotesk.
- Rules enforced by e2e/design-system.spec.ts on 6 routes.

## Typography (2026-11-06)
- Reference: kubehotel-saint-tropez.com, measured values in direction.md section 0.
- Titles use Italiana as a stand-in until the Saphion web licence and file arrive. Swap in app/[locale]/layout.tsx with next/font/local, weight 300, variable --font-title.
- Do not copy the font file from the reference site.
- MyFonts order received: Neo Saphion Light, desktop licence only. The EULA forbids installing the font on any server, so it is NOT in the project. A web licence is needed before integration.
- MyFonts web kit received: Neo Saphion Light integrated from app/fonts, Italiana removed. Keep the licence notice in globals.css and app/fonts.
- Header logo: public/brand/logo-pieds.svg, centred. Old logo.svg and logo-reversed.svg are unused.
- Site background changed to white. #8AD6D1 is now the highlight accent.
- Hero title replaced by the subtitle sentence; brand name stays in the logo and footer.

## Section 4 (2026-11-06)
- Built: right-aligned title, offset grid (Sapotille tall on the left, Maracudja and Carambole stacked on the right), parallax in components/UnitParallax.tsx from 768px, no parallax on phones or under reduced motion.
- introText removed from the home section, still used as the meta description. Price overflow at 768px fixed.
- e2e/units.spec.ts added. 97 e2e, 21 unit, tsc OK, lint 0 errors.
- Waiting for the user's "valide" before section 5.

## Header (2026-11-06)
- Language dropdown far left, logo centred, menu on the right: La plage (external link), Nos gîtes dropdown, Contact, Réserver. components/Dropdown.tsx replaces MobileMenu.tsx.
- Réserver replaces every availability label and leads to the contact form. Photos, Tarifs, Situation and Avis moved to the footer.
- Header now uses the page margin on every page. e2e/header.spec.ts added.

## Section 5 (2026-11-06)
- Built: text and included services on the left, garden flower photo on the right, full-screen height. No portrait of Marie-Claude yet.
- e2e/host.spec.ts added. 126 e2e, 21 unit, tsc OK, lint 0 errors.
- Waiting for the user's "valide" before section 6.

## Section 6 (2026-11-06)
- Built: right-aligned title, two offset quotes in Neo Saphion at the h4 size, link to all reviews. ReviewCard gets a `large` variant; /avis keeps body text.
- typographic() now replaces every apostrophe. e2e/reviews.spec.ts added.
- Waiting for the user's "valide" before section 7.

## Section 4 rework (2026-11-06)
- On request: Sapotille and Maracudja side by side with vertical photos (4:5), Carambole below with a full-width horizontal photo (2:1).
- Maracudja crop kept from the 1200x800 file, about 15% upscaled at 1440.

## Section 4 full-screen (2026-11-06)
- On request: photos cover the viewport, no margins. Two half-screen photos then one full-screen photo at 768px and up; three full-screen photos stacked on phones. Text sits on the photos.
- Plain black veil at 53%, chosen from measurements on the real photos: 0.50 gives 4.32:1, 0.55 gives 5.16:1 on the worst card. e2e/units.spec.ts measures 4.5:1 on screenshots.

## Section 4 hover (2026-11-06)
- On hover or keyboard focus, each photo fades to another photo of the same gîte (Sapotille bedroom, Maracudja bedroom, Carambole terrace). Not downloaded on touch screens. Contrast measured on these photos too.

## Section 4 name only (2026-11-06)
- Home photos show only the gîte name. Price and details stay on the "Autres gîtes" cards of the gîte pages.
- Veil stays at 53%: Maracudja's rail behind the name gives 4.18:1 at 50% and 4.67:1 at 53% at 1440. Without that rail, 45% would nearly hold everywhere.

## No garden (2026-11-06)
- User: there is no garden; those photos only present the website. Section 7 Jardin dropped. Photo alt and constant renamed.
- Still mentioning a garden, waiting for the user: content/units.ts (Carambole floor and description), noSeaView in the dictionaries, Monique's review.

## Section 3 parallax (2026-11-06)
- On request: single beach photo with parallax, 100svh, top-down reveal kept. components/BeachParallax.tsx, e2e/beach.spec.ts.
- WebGL story removed: PhotoStory, lib/webgl, story.spec, gate and path captions. Archive in _ref/archive/section-3-webgl.zip. Five WebGL unit tests went with it.
- Photo rights unverified: file name credits Guillaume Aricique, no metadata, no licence in the project. Must be cleared before going live.

## Section 8 (2026-11-06)
- Sections 3, 4 and 6 validated by the user.
- Built: closing block on #8AD6D1, title top left, Réserver and gallery link bottom right. Not on the dark green of the plan: it would merge with the footer.
- e2e/closing.spec.ts added. Waiting for the user's "valide" before the footer.

## Section 8 dropped, hero simplified (2026-11-06)
- On request: closing section removed, the page ends on the photo strip then the footer. Hero button and link removed to cut redundancy; Réserver lives in the header.

## Section 2 reveal (2026-11-06)
- On request: manifesto words start at 12% opacity and appear one by one with the scroll, with their highlight. Fully visible without JavaScript and under reduced motion.

## Section 9 (2026-11-06)
- Built: footer on the page margins, name at the largest title size (43px at 1440, not "very large": the type scale caps it), links and contact on the right half, rolling labels. e2e/footer.spec.ts added.
- All sections of the home page are done. Waiting for the user's "valide".

## Section 2 no highlight (2026-11-06)
- On request: teal background removed from the manifesto reveal. Opacity only.

## Footer logo (2026-11-06)
- On request: logo on the left at 192px, three times the header logo, replaces the name. Same on every page, since the footer is shared.

## Consistency pass (2026-11-06)
- Audit option A applied: inner pages on the page margin, shared spacing, square corners, 1px rules, one text colour. e2e/page-layout.spec.ts added.
- Still open from the audit: pricing table on phones, title hierarchy, off-scale text styles, small tap targets.

## Audit, second pass (2026-11-06)
- Pricing cards on phones, short contact title, price as information, two weights only, 24px targets. e2e/page-layout.spec.ts extended, design-system.spec.ts now allows weights 300 and 500 only.

## Footer 3D logo (2026-11-06)
- On request: 3D logo in the footer, ported from the supplied HTML to components/FooterLogo.tsx and lib/logo3d. New dependencies: three, @types/three. No CDN, no orbit controls, no toolbar.
- Lazy loaded near the footer, paused off screen, still under reduced motion, flat logo as fallback.

## Beach caption removed (2026-11-06)
- On request: no caption on the parallax photo. Footer logo: the live effect alone claims the canvas under Strict Mode.

## Hero greeting removed (2026-11-06)
- On request: "Bonjou !" removed. The hero now carries only the title; Réserver stays in the header.

## Section 2 pictures (2026-11-06)
- On request: starfish and shell enter from the sides with the scroll. Extracted from the supplied Canva SVGs to public/images/decor (WebP, 72 and 33 KB). Canva marks them as AI generated; the conversion drops that metadata.

## Footer sign-off removed (2026-11-06)
- On request: "Annou alé — on vous attend !" removed. The logo stands alone on the left.

## Section 4 title reveal (2026-11-06)
- On request: "Trois gîtes, une plage" reveals word by word with the scroll. revealWords in lib/motion.ts is shared with the manifesto; components/ScrollWords.tsx.

## No parallax, no transition (2026-11-06)
- All parallax removed on request: manifesto pictures, beach photo, gîte photos (UnitParallax). The beach is a plain photo, with no reveal.
- Rising tide, moving sea, water strips and tide outlines were built, then removed on request.
- Manifesto text and "Trois gîtes, une plage" centred on request, manifesto column capped at 48rem.
- On request: the gîtes section covers the sticky beach photo, which drifts slower. BeachParallax is back with this behaviour. .beach-stage limits the sticking to that one section.

## Hero after Hotel du Tasso (2026-11-06)
- On request, composition taken from hoteldutassosorrento.com (Awwwards nominee, slug hotel-du-tasso), own assets only: pale frame, white panel, small photo top left, tall video right, title bottom left, panel opening at the intro. Phone: full-screen video, centred title. No logo, copy, photo or font taken from it. No scroll-down button: the hero stays title-only.
- Header logo doubled to 128px on the hero only, back to 64px in the solid header and on the other pages.
- Section 3 photo replaced by chambre-balcon.webp (original 2026-10-14 53, Michel R. Photography) because the old beach photo had no licence. The old file remains in the git history.
