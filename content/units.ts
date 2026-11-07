export interface LocalizedText {
  fr: string;
  en: string;
}

export const unitSlugs = ["sapotille", "maracudja", "carambole"] as const;
export type UnitSlug = (typeof unitSlugs)[number];

export interface Unit {
  slug: UnitSlug;
  name: string;
  registrationNumber: string;
  capacity: number;
  surfaceAreaM2: number;
  terraceAreaM2?: number;
  floor: LocalizedText;
  seaView: boolean;
  wheelchairAccessible: boolean;
  description: LocalizedText;
  sleeping: LocalizedText;
  amenities: LocalizedText[];
  outdoor: LocalizedText;
  // First photo leads the card and the page. Assigned by matching decor against the old site's galleries.
  photos: string[];
}

const amenity = {
  ac: { fr: "Climatisation", en: "Air conditioning" },
  kitchen: { fr: "Cuisine équipée", en: "Equipped kitchen" },
  fridge: { fr: "Réfrigérateur", en: "Fridge" },
  freezer: { fr: "Congélateur", en: "Freezer" },
  microwave: { fr: "Four à micro-ondes", en: "Microwave" },
  miniOven: { fr: "Mini-four", en: "Mini oven" },
  hob: { fr: "Plaques électriques (2 feux)", en: "Two-ring electric hob" },
  coffee: { fr: "Cafetière électrique", en: "Coffee maker" },
  toaster: { fr: "Grille-pain", en: "Toaster" },
  tv: { fr: "Téléviseur LCD", en: "LCD TV" },
  hairdryer: { fr: "Sèche-cheveux", en: "Hairdryer" },
  washer: { fr: "Lave-linge", en: "Washing machine" },
  iron: { fr: "Fer et table à repasser", en: "Iron and ironing board" },
  wifi: { fr: "Wifi", en: "Wifi" },
  solar: { fr: "Eau chaude solaire", en: "Solar hot water" },
  bbq: { fr: "Barbecue", en: "Barbecue" },
  linen: { fr: "Linge de maison fourni", en: "Linen provided" },
} satisfies Record<string, LocalizedText>;

const outdoor: LocalizedText = {
  fr: "Terrasse couverte avec table et 4 chaises, barbecue, douche extérieure.",
  en: "Covered terrace with a table and 4 chairs, barbecue, outdoor shower.",
};

const photo = (name: string): string => `/images/gallery/${name}.jpg`;

export const units: Unit[] = [
  {
    slug: "sapotille",
    name: "Sapotille",
    registrationNumber: "97128000459 D4",
    capacity: 4,
    surfaceAreaM2: 70,
    floor: {
      fr: "Rez-de-chaussée, face à la mer",
      en: "Ground floor, facing the sea",
    },
    seaView: true,
    wheelchairAccessible: true,
    description: {
      fr: "Grand appartement de 70 m² au rez-de-chaussée, avec une très grande terrasse vue mer. La douche accessible en fauteuil convient aux personnes à mobilité réduite, aux familles avec bébé et aux personnes âgées.",
      en: "A large 70 m² ground-floor apartment with a very big sea-view terrace. The wheelchair-accessible shower suits guests with reduced mobility, families with babies and older travellers.",
    },
    sleeping: {
      fr: "Chambre avec grand lit, armoire et climatisation. Grand séjour avec clic-clac.",
      en: "Bedroom with a double bed, wardrobe and air conditioning. Large living room with a sofa bed.",
    },
    amenities: [
      amenity.ac,
      amenity.kitchen,
      amenity.fridge,
      amenity.freezer,
      amenity.microwave,
      amenity.miniOven,
      amenity.hob,
      amenity.coffee,
      amenity.toaster,
      amenity.tv,
      amenity.washer,
      amenity.iron,
      amenity.wifi,
      amenity.solar,
      amenity.bbq,
      amenity.linen,
    ],
    outdoor,
    photos: [
      photo("2026-10-14-20"),
      photo("2026-10-14-19"),
      photo("2026-10-14-18"),
      photo("2026-10-14-17"),
      photo("2026-10-14-28"),
      photo("2026-10-14-35-panorama"),
      photo("2026-10-14-22"),
    ],
  },
  {
    slug: "maracudja",
    name: "Maracudja",
    registrationNumber: "9712800045717",
    capacity: 4,
    surfaceAreaM2: 35,
    terraceAreaM2: 16,
    floor: {
      fr: "Appartement T2, face à la mer",
      en: "One-bedroom apartment, facing the sea",
    },
    seaView: true,
    wheelchairAccessible: false,
    description: {
      fr: "Appartement T2 de 35 m² face à la mer, avec vue sur le lagon et 16 m² de terrasse ensoleillée équipée d'une cuisine.",
      en: "A 35 m² one-bedroom apartment facing the sea, with a lagoon view and a 16 m² sunny terrace with its own kitchen.",
    },
    sleeping: {
      fr: "Chambres climatisées avec grand lit, armoire, chevets et lampes.",
      en: "Air-conditioned bedrooms with a double bed, wardrobe, bedside tables and lamps.",
    },
    amenities: [
      amenity.ac,
      amenity.kitchen,
      amenity.fridge,
      amenity.freezer,
      amenity.microwave,
      amenity.hob,
      amenity.coffee,
      amenity.toaster,
      amenity.tv,
      amenity.hairdryer,
      amenity.washer,
      amenity.iron,
      amenity.wifi,
      amenity.solar,
      amenity.bbq,
      amenity.linen,
    ],
    outdoor,
    photos: [
      photo("2026-10-14-52"),
      photo("2026-10-14-53"),
      photo("2026-10-14-49"),
      photo("2026-10-14-56"),
      photo("2026-10-14-57"),
      photo("2026-10-14-48"),
      photo("2026-10-14-51"),
      photo("2026-10-14-60"),
    ],
  },
  {
    slug: "carambole",
    name: "Carambole",
    registrationNumber: "971280004582 M",
    capacity: 2,
    surfaceAreaM2: 20,
    terraceAreaM2: 16,
    floor: {
      fr: "1er étage, terrasse côté jardin",
      en: "First floor, garden-side terrace",
    },
    seaView: false,
    wheelchairAccessible: false,
    description: {
      fr: "Studio de 20 m² avec 16 m² de terrasse donnant sur le jardin, pour une ou deux personnes.",
      en: "A 20 m² studio with a 16 m² terrace overlooking the garden, for one or two guests.",
    },
    sleeping: {
      fr: "Chambre avec grand lit, armoire, chevet, télévision et climatisation. Salle de bain avec douche, WC et rangements.",
      en: "Bedroom with a double bed, wardrobe, bedside table, TV and air conditioning. Bathroom with shower, toilet and storage.",
    },
    amenities: [
      amenity.ac,
      amenity.kitchen,
      amenity.fridge,
      amenity.microwave,
      amenity.hob,
      amenity.coffee,
      amenity.toaster,
      amenity.tv,
      amenity.hairdryer,
      amenity.washer,
      amenity.iron,
      amenity.wifi,
      amenity.solar,
      amenity.bbq,
      amenity.linen,
    ],
    outdoor,
    photos: [
      photo("2026-10-14-43"),
      photo("2026-10-14-42"),
      photo("2026-10-14-40"),
      photo("2026-10-14-45"),
    ],
  },
];

export function getUnitBySlug(slug: string): Unit | undefined {
  return units.find((unit) => unit.slug === slug);
}
