import type { Dictionary } from "./types";
import { fr } from "./fr";
import { en } from "./en";

export type { Dictionary };
export type Locale = "fr" | "en";

export const locales: Locale[] = ["fr", "en"];
export const defaultLocale: Locale = "fr";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
