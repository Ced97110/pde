import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { reviews } from "@/content/reviews";
import { ReviewCard } from "@/components/ReviewCard";

export default async function ReviewsPage({ params }: PageProps<"/[locale]/avis">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.reviews.title}</h1>
      <div className="mt-5 grid gap-x-3 gap-y-10 sm:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.author} review={review} locale={locale} dict={dict} />
        ))}
      </div>
    </div>
  );
}
