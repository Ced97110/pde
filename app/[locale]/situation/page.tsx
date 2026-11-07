import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { business } from "@/content/business";

export default async function LocationPage({ params }: PageProps<"/[locale]/situation">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.location.title}</h1>
      <p className="reading mt-5">
        {business.address.street}, {business.address.postalCode} {business.address.city},{" "}
        {business.address.region}
      </p>

      <div className="reading mt-5 space-y-4">
        <p>{dict.location.text1}</p>
        <p>{dict.location.text2}</p>
        <p>{dict.location.text3}</p>
      </div>
    </div>
  );
}
