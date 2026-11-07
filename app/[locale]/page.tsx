import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { units, type UnitSlug } from "@/content/units";
import { reviews } from "@/content/reviews";
import { policies } from "@/content/pricing";
import { business } from "@/content/business";
import { HeroIntro } from "@/components/HeroIntro";
import { BeachParallax } from "@/components/BeachParallax";
import { Manifesto } from "@/components/Manifesto";
import { ReviewCard } from "@/components/ReviewCard";
import { RollingLabel } from "@/components/RollingLabel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ScrollWords } from "@/components/ScrollWords";
import { UnitCard } from "@/components/UnitCard";
import { HERO_INTRO_BOOTSTRAP } from "@/lib/hero-intro";
import { typographic } from "@/lib/typography";

// Focus keeps the subject inside the crops, down to a phone screen. hoverIndex points into unit.photos,
// so the second photo always belongs to the same gîte.
const UNIT_CARD_PHOTOS: Record<UnitSlug, { focus: string; hoverIndex: number; hoverFocus: string }> = {
  sapotille: { focus: "42% 50%", hoverIndex: 4, hoverFocus: "32% 50%" },
  maracudja: { focus: "62% 50%", hoverIndex: 2, hoverFocus: "45% 50%" },
  carambole: { focus: "72% 50%", hoverIndex: 1, hoverFocus: "60% 50%" },
};
const HERO_SLIDES = [
  { src: "/images/hero/plage.jpg", focus: "object-[50%_60%]" },
  { src: "/images/hero/allee.jpg", focus: "object-[50%_50%]" },
];
const BALCONY_PHOTO = "/images/chambre-balcon.webp";
const HOST_PHOTO = "/images/gallery/2026-10-31-24.jpg";
const PRESENTATION_PHOTOS = [
  "/images/gallery/2026-10-31-14.jpg",
  "/images/gallery/2026-10-31-2.jpg",
  "/images/gallery/2026-10-14-38.jpg",
];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: HERO_INTRO_BOOTSTRAP }} />
      <HeroIntro />
      <ScrollReveal />

      <section className="hero relative flex min-h-svh items-center justify-center overflow-hidden text-white">
        <div className="hero-media absolute inset-0">
          {HERO_SLIDES.map(({ src, focus }, index) => (
            <div key={src} className="hero-slide absolute inset-0">
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                className={`object-cover ${focus}`}
                {...(index === 0 ? { preload: true } : { loading: "eager" as const })}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/[0.53]" />
        </div>

        <div className="hero-copy relative flex w-full flex-col items-center gap-8 px-[var(--page-margin)]">
          <h1 className="hero-title">{dict.hero.subtitle}</h1>
          <Link href={`/${locale}/contact`} className="hero-book btn">
            <RollingLabel text={dict.nav.book} />
          </Link>
        </div>
      </section>

      <Manifesto text={dict.home.manifesto} />

      <BeachParallax src={BALCONY_PHOTO} alt={dict.home.beachPhotoAlt} />

      <section id="gites" className="beach-cover relative bg-background pt-20 sm:pt-28">
        <ScrollWords text={dict.home.unitsTitle} className="section-title px-[var(--page-margin)] text-center text-persienne" />
        <div className="units-grid mt-12 grid md:grid-cols-2">
          {units.map((unit, index) => (
            <UnitCard
              key={unit.slug}
              unit={unit}
              locale={locale}
              dict={dict}
              layout={index < 2 ? "portrait" : "landscape"}
              photoFocus={UNIT_CARD_PHOTOS[unit.slug].focus}
              hoverPhoto={unit.photos[UNIT_CARD_PHOTOS[unit.slug].hoverIndex]}
              hoverPhotoFocus={UNIT_CARD_PHOTOS[unit.slug].hoverFocus}
            />
          ))}
        </div>
      </section>

      <section className="host grid min-h-svh gap-10 px-[var(--page-margin)] py-20 sm:py-28 lg:grid-cols-2 lg:gap-x-3">
        <div data-reveal className="host-text flex flex-col justify-between gap-10 lg:pr-12">
          <div className="max-w-xl">
            <h2 className="section-title text-persienne">{dict.home.hostTitle}</h2>
            <p className="mt-5">{dict.home.hostText}</p>
            <p className="mt-5">{dict.home.creoleFlourish}</p>
          </div>
          <ul>
            {policies.includedServices[locale].map((service) => (
              <li key={service} className="border-t border-line py-3 last:border-b">
                {service}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal="photo" className="host-photo relative aspect-[4/5] overflow-hidden sm:aspect-[3/2] lg:aspect-auto">
          <Image
            src={HOST_PHOTO}
            alt={dict.home.hostPhotoAlt}
            fill
            sizes="(min-width: 1024px) 80vw, (min-width: 640px) 100vw, 170vw"
            className="object-cover object-[40%_50%]"
          />
        </div>
      </section>

      <section className="reviews flex min-h-[70svh] flex-col px-[var(--page-margin)] py-20 sm:py-28">
        <h2 data-reveal className="section-title text-right text-persienne">
          {typographic(dict.home.reviewsTitle)}
        </h2>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-x-3">
          {reviews.slice(0, 2).map((review, index) => (
            <div data-reveal key={review.author} className={index === 1 ? "lg:mt-24" : undefined}>
              <ReviewCard review={review} locale={locale} dict={dict} large />
            </div>
          ))}
        </div>
        <Link href={`/${locale}/avis`} className="mt-10 self-end py-0.5 text-accent underline underline-offset-4">
          {dict.home.reviewsCta}
        </Link>
      </section>

      <section className="grid sm:grid-cols-3">
        {PRESENTATION_PHOTOS.map((src) => (
          <div data-reveal="photo" key={src} className="relative aspect-[3/2]">
            <Image src={src} alt={`${business.name}, Sainte-Anne`} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
          </div>
        ))}
      </section>
    </>
  );
}
