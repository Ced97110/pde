export interface Season {
  key: "high" | "mid" | "low";
  label: { fr: string; en: string };
  dateRange: { fr: string; en: string };
}

export const seasons: Season[] = [
  {
    key: "high",
    label: { fr: "Haute saison", en: "High season" },
    dateRange: { fr: "1er novembre au 30 avril", en: "Nov 1 – Apr 30" },
  },
  {
    key: "mid",
    label: { fr: "Moyenne saison", en: "Mid season" },
    dateRange: { fr: "1er mai au 31 août", en: "May 1 – Aug 31" },
  },
  {
    key: "low",
    label: { fr: "Basse saison", en: "Low season" },
    dateRange: { fr: "1er septembre au 31 octobre", en: "Sep 1 – Oct 31" },
  },
];

export interface WeeklyRate {
  unitSlug: "sapotille" | "carambole" | "maracudja";
  capacity: number;
  high: number;
  mid: number;
  low: number;
}

// Weekly rates in EUR. Source: current site (gites-sainte-anne.com), as of
// the last extraction. TODO (user to confirm): no year is stated on the
// source site — verify these are still current before publishing.
export const weeklyRates: WeeklyRate[] = [
  { unitSlug: "sapotille", capacity: 4, high: 665, mid: 505, low: 440 },
  { unitSlug: "maracudja", capacity: 4, high: 665, mid: 505, low: 440 },
  { unitSlug: "carambole", capacity: 2, high: 560, mid: 380, low: 330 },
];

export function lowestWeeklyRate(unitSlug: WeeklyRate["unitSlug"]): number | undefined {
  return weeklyRates.find((rate) => rate.unitSlug === unitSlug)?.low;
}

export const policies = {
  longStayDiscounts: [
    { weeks: 2, discountPercent: 5 },
    { weeks: 3, discountPercent: 10 },
    { weeks: 4, discountPercent: 15 },
  ],
  minimumStayNights: 3,
  shortStaySurchargeEur: 15,
  depositPercent: 50,
  cleaningFeeEur: 50,
  touristTaxPerAdultPerNightEur: 2.3,
  extraGuestFee: { fr: "Gratuit", en: "Free" },
  includedServices: {
    fr: [
      "Citerne d'eau (pas de coupure d'eau)",
      "Draps, taies et torchons fournis",
      "Parking gratuit et sécurisé",
      "Wifi gratuit",
      "Premier petit-déjeuner offert",
      "Lit bébé mis à disposition",
    ],
    en: [
      "Water tank (no water cuts)",
      "Linens and towels provided",
      "Free secure parking",
      "Free wifi",
      "First breakfast complimentary",
      "Baby cot available on request",
    ],
  },
  // TODO (user to confirm): the current site does not state check-in/out
  // times, pet/smoking rules, or a cancellation policy. Fill these in
  // before publishing — see also content/business.ts TODOs.
  checkInTime: null,
  checkOutTime: null,
  petsAllowed: null,
  smokingAllowed: null,
  cancellationPolicy: null,
} as const;
