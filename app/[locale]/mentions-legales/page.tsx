import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { business } from "@/content/business";

export default async function LegalNoticePage({
  params,
}: PageProps<"/[locale]/mentions-legales">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const isFr = locale === "fr";

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.legal.title}</h1>

      <div className="reading mt-5 space-y-4">
        <p>
          {isFr ? "Propriétaire et éditeur du site : " : "Site owner and publisher: "}
          {business.legal.owner}, {business.address.street}, {business.address.postalCode}{" "}
          {business.address.city}, {business.address.region}.
        </p>
        <p>
          {isFr ? "Contact : " : "Contact: "}
          {business.contact.email} — {business.contact.phoneDisplay}
        </p>
        <p>{isFr ? "Hébergeur : " : "Hosting provider: "}{business.legal.host}.</p>
        <p>
          {isFr
            ? "Note : aucun numéro SIRET n'a été trouvé sur le site actuel. À compléter avant publication."
            : "Note: no business registration number (SIRET) was found on the current site. To be completed before publishing."}
        </p>
      </div>
    </div>
  );
}
