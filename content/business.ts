export type Locale = "fr" | "en";

export const business = {
  name: "Les Pieds dans l'eau",
  alternateName: "Résidence Les Eaux Bleues",
  beachGuideUrl: "https://www.lesilesdeguadeloupe.com/patrimoine-naturel/plage-de-sainte-anne/",
  tagline: {
    fr: "Gîtes touristiques en bord de mer à Sainte-Anne, Guadeloupe",
    en: "Seaside holiday rentals in Sainte-Anne, Guadeloupe",
  },
  address: {
    street: "Boulevard Georges Mandel",
    postalCode: "97180",
    city: "Sainte-Anne",
    region: "Guadeloupe",
  },
  contact: {
    phone: "+590 690 50 34 58",
    phoneDisplay: "0690 50 34 58",
    contactName: "Madame Panol",
    email: "residenceleseauxbleues@gmail.com",
    carRentalPartnerPhone: "06 46 64 45 13",
  },
  // TODO (user to confirm): no GPS coordinates or social media links were
  // found on the current site. Add Instagram/Facebook/WhatsApp here once available.
  social: {
    instagram: null,
    facebook: null,
    whatsapp: null,
  },
  legal: {
    owner: "Panol (particulier)",
    host: "OVH, 2 rue Kellermann, 59100 Roubaix",
    // TODO: no SIRET found on the current site — confirm before publishing mentions légales.
    siret: null,
  },
} as const;

export function lodgingStructuredData(locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: business.name,
    alternateName: business.alternateName,
    description: business.tagline[locale],
    telephone: business.contact.phone,
    email: business.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: "GP",
    },
  };
}
