import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { business } from "@/content/business";
import { getDictionary, isLocale, locales } from "@/content/dictionaries";
import type { Locale } from "@/content/dictionaries";
import { lowestWeeklyRate } from "@/content/pricing";
import { units, getUnitBySlug } from "@/content/units";
import { Gallery } from "@/components/Gallery";
import { UnitCard } from "@/components/UnitCard";

// The three gîtes are prerendered; only unknown slugs resolve at request time, then 404.
export const instant = false;

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  return locales.flatMap((locale) => units.map((unit) => ({ locale, slug: unit.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/gites/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const unit = getUnitBySlug(slug);
  if (!isLocale(locale) || !unit) return {};

  return {
    title: `${unit.name} — ${business.name}`,
    description: unit.description[locale],
  };
}

export default async function UnitPage({ params }: PageProps<"/[locale]/gites/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const unit = getUnitBySlug(slug);
  if (!unit) notFound();

  const dict = getDictionary(locale);
  const availabilityHref = `/${locale}/contact?gite=${unit.slug}`;
  const priceLabel = `${dict.units.from} ${lowestWeeklyRate(unit.slug)} € ${dict.pricing.perWeekShort}`;
  const yes = dict.units.yes;

  const features: Array<[string, string]> = [
    [dict.units.surfaceLabel, `${unit.surfaceAreaM2} ${dict.units.surface}`],
    [dict.units.guestsLabel, `${unit.capacity} ${dict.units.capacity}`],
    ...(unit.terraceAreaM2
      ? ([[dict.units.terraceLabel, `${unit.terraceAreaM2} ${dict.units.surface}`]] as Array<[string, string]>)
      : []),
    [dict.units.locationLabel, unit.floor[locale]],
    [dict.units.sleepingTitle, unit.sleeping[locale]],
    [dict.units.outdoorTitle, unit.outdoor[locale]],
    ...(unit.wheelchairAccessible
      ? ([[dict.units.wheelchair, yes]] as Array<[string, string]>)
      : []),
  ];

  return (
    <>
      <div className="relative h-[60svh] min-h-80">
        <Image
          src={unit.photos[0]}
          alt={`${unit.name} — ${unit.floor[locale]}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="page flex flex-col gap-16">
      <div className="grid gap-x-3 gap-y-16 lg:grid-cols-[1fr_20rem]">
        <article>
          <Link href={`/${locale}#gites`} className="inline-block py-1 underline underline-offset-4">
            ← {dict.units.backToUnits}
          </Link>
          <h1 className="mt-2 text-persienne">{unit.name}</h1>
          <p className="reading mt-5">{unit.description[locale]}</p>

          <section className="mt-16">
            <h2 className="text-persienne">{dict.units.featuresTitle}</h2>
            <dl className="mt-5">
              {features.map(([label, value]) => (
                <div key={label} className="grid gap-1 border-t border-line py-3 sm:grid-cols-[14rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16">
            <h2 className="text-persienne">{dict.units.amenitiesTitle}</h2>
            <ul className="mt-5 grid gap-x-3 gap-y-1 sm:grid-cols-2">
              {unit.amenities.map((amenity) => (
                <li key={amenity.fr}>{amenity[locale]}</li>
              ))}
            </ul>
          </section>

          <p className="mt-5 text-muted">
            {dict.units.registration} : {unit.registrationNumber}
          </p>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 border border-line bg-surface p-5">
            <p className="font-medium tabular-nums">{priceLabel}</p>
            <Link href={availabilityHref} className="btn btn-primary mt-4 w-full">
              {dict.nav.book}
            </Link>
            <Link href={`/${locale}/tarifs`} className="mt-3 block py-0.5 text-center text-sm underline underline-offset-4">
              {dict.units.viewPricing}
            </Link>
          </div>
        </aside>
      </div>

      <section id="gallery">
        <h2 className="text-persienne">{dict.nav.gallery}</h2>
        <div className="mt-5">
          <Gallery images={unit.photos} closeLabel={dict.gallery.close} altPrefix={unit.name} />
        </div>
      </section>

      <section>
        <h2 className="text-persienne">{dict.units.otherUnits}</h2>
        <div className="mt-5 grid gap-x-3 gap-y-10 sm:grid-cols-2">
          {units
            .filter((other) => other.slug !== unit.slug)
            .map((other) => (
              <UnitCard key={other.slug} unit={other} locale={locale} dict={dict} />
            ))}
        </div>
      </section>
      </div>

      <div className="mobile-booking-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 lg:hidden">
        <p className="tabular-nums">{priceLabel}</p>
        <Link href={availabilityHref} className="btn btn-primary !py-2.5 text-sm">
          {dict.nav.book}
        </Link>
      </div>
    </>
  );
}
