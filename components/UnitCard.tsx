import Image from "next/image";
import Link from "next/link";
import type { Unit } from "@/content/units";
import { lowestWeeklyRate } from "@/content/pricing";
import type { Dictionary, Locale } from "@/content/dictionaries";

type UnitCardLayout = "default" | "portrait" | "landscape";

// The full-screen frames crop 3:2 photos to the viewport height, so they need more width than they show.
const FULL_SCREEN_SIZES = "(min-width: 768px) 105vw, 325vw";

const IMAGE_SIZES: Record<UnitCardLayout, string> = {
  default: "(min-width: 640px) 50vw, 100vw",
  portrait: FULL_SCREEN_SIZES,
  landscape: FULL_SCREEN_SIZES,
};

const CARD_CLASSES: Record<UnitCardLayout, string> = {
  default: "",
  portrait: "relative h-svh",
  landscape: "relative h-svh md:col-span-2",
};

const FRAME_CLASSES: Record<UnitCardLayout, string> = {
  default: "relative aspect-[3/2]",
  portrait: "absolute inset-0",
  landscape: "absolute inset-0",
};

interface UnitCardProps {
  unit: Unit;
  locale: Locale;
  dict: Dictionary;
  layout?: UnitCardLayout;
  photoFocus?: string;
  hoverPhoto?: string;
  hoverPhotoFocus?: string;
}

export function UnitCard({ unit, locale, dict, layout = "default", photoFocus, hoverPhoto, hoverPhotoFocus }: UnitCardProps) {
  const isOverlay = layout !== "default";

  return (
    <Link href={`/${locale}/gites/${unit.slug}`} className={`unit-card group block ${CARD_CLASSES[layout]}`}>
      <div className={`unit-card-frame overflow-hidden ${FRAME_CLASSES[layout]}`}>
        <div className="unit-card-media absolute inset-0">
          <Image
            src={unit.photos[0]}
            alt={`${unit.name} — ${unit.floor[locale]}`}
            fill
            sizes={IMAGE_SIZES[layout]}
            style={photoFocus ? { objectPosition: photoFocus } : undefined}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {hoverPhoto && (
            <div className="unit-card-alt absolute inset-0">
              <Image
                src={hoverPhoto}
                alt=""
                fill
                sizes={IMAGE_SIZES[layout]}
                style={hoverPhotoFocus ? { objectPosition: hoverPhotoFocus } : undefined}
                className="object-cover"
              />
            </div>
          )}
        </div>
        {isOverlay && <div className="unit-card-veil absolute inset-0" />}
      </div>
      {isOverlay ? (
        <h3 className="unit-card-caption absolute bottom-8 left-[var(--page-margin)] text-white">{unit.name}</h3>
      ) : (
        <div className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-persienne">{unit.name}</h3>
            <p className="text-sm tabular-nums text-accent">
              {dict.units.from} {lowestWeeklyRate(unit.slug)} € {dict.pricing.perWeekShort}
            </p>
          </div>
          <p className="mt-1 text-muted">
            {unit.surfaceAreaM2} {dict.units.surface} · {unit.capacity} {dict.units.capacity} ·{" "}
            {unit.seaView ? dict.units.seaView : dict.units.noSeaView}
          </p>
        </div>
      )}
    </Link>
  );
}
