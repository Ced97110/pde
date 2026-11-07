import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { business } from "@/content/business";
import { ContactForm, ContactFormFromUrl } from "@/components/ContactForm";

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const phoneHref = `tel:${business.contact.phone.replaceAll(" ", "")}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${business.address.street}, ${business.address.postalCode} ${business.address.city}`,
  )}`;

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.contact.title}</h1>
      <div className="reading mt-5 space-y-1">
        <p>
          {dict.contact.messageStart}{" "}
          <a href={phoneHref} className="whitespace-nowrap underline underline-offset-4">
            {business.contact.phoneDisplay}
          </a>{" "}
          {dict.contact.messageMiddle}{" "}
          <a href={`mailto:${business.contact.email}`} className="underline underline-offset-4">
            {dict.contact.messageEmail}
          </a>
          .
        </p>
        <p>{dict.contact.subtitle}</p>
      </div>

      <div className="mt-16 grid gap-x-3 gap-y-16 lg:grid-cols-2">
        <Suspense fallback={<ContactForm dict={dict.contact} />}>
          <ContactFormFromUrl dict={dict.contact} />
        </Suspense>

        <aside className="self-start border-t border-line pt-5">
          <h2 className="text-persienne">{dict.contact.directTitle}</h2>
          <address className="mt-5 flex flex-col gap-1 not-italic">
            <span>{business.contact.contactName}</span>
            <a href={phoneHref} className="py-0.5 underline underline-offset-4">
              {business.contact.phoneDisplay}
            </a>
            <a href={`mailto:${business.contact.email}`} className="break-all py-0.5 underline underline-offset-4">
              {business.contact.email}
            </a>
            <span className="mt-3">
              {business.address.street}, {business.address.postalCode} {business.address.city},{" "}
              {business.address.region}
            </span>
            <a href={mapHref} target="_blank" rel="noreferrer" className="py-0.5 underline underline-offset-4">
              {dict.contact.openMap}
            </a>
          </address>
        </aside>
      </div>
    </div>
  );
}
