import type { Review } from "@/content/reviews";
import type { Dictionary, Locale } from "@/content/dictionaries";
import { typographic } from "@/lib/typography";

interface ReviewCardProps {
  review: Review;
  locale: Locale;
  dict: Dictionary;
  large?: boolean;
}

export function ReviewCard({ review, locale, dict, large = false }: ReviewCardProps) {
  const text = large ? typographic(review.text[locale]) : review.text[locale];

  return (
    <figure className="flex flex-col gap-4 border-t border-line pt-5">
      <blockquote lang={locale === "en" ? "en" : "fr"} className={large ? "title-type !leading-[1.3]" : undefined}>
        « {text} »
      </blockquote>
      <figcaption className="text-sm text-muted">
        <span className="text-foreground">{review.author}</span>, {review.date[locale]}
        {locale === "en" && ` · ${dict.reviews.translated}`}
      </figcaption>
    </figure>
  );
}
