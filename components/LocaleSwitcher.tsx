"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/content/dictionaries";
import { locales } from "@/content/dictionaries";
import { Dropdown } from "./Dropdown";

const LOCALE_NAMES: Record<Locale, string> = { fr: "Français", en: "English" };

interface LocaleSwitcherProps {
  locale: Locale;
  label: string;
}

function pathForLocale(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

export function LocaleSwitcher({ locale, label }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const code = locale.toUpperCase();

  return (
    <Dropdown label={code} ariaLabel={`${label} : ${code}`} align="left" className="label">
      {locales.map((target) => (
        <Link
          key={target}
          href={pathForLocale(pathname, target)}
          hrefLang={target}
          lang={target}
          aria-current={target === locale ? "true" : undefined}
          className="menu-link"
        >
          {LOCALE_NAMES[target]}
        </Link>
      ))}
    </Dropdown>
  );
}
