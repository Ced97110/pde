import Image from "next/image";
import Link from "next/link";
import { units } from "@/content/units";
import { business } from "@/content/business";
import type { Dictionary, Locale } from "@/content/dictionaries";
import { Dropdown } from "./Dropdown";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { RollingLabel } from "./RollingLabel";
import { CueArrow } from "./CueArrow";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function Header({ locale, dict }: HeaderProps) {
  const base = `/${locale}`;
  const contactHref = `${base}/contact`;
  const beachLinkProps = { href: business.beachGuideUrl, target: "_blank", rel: "noopener noreferrer" };
  const unitLinks = units.map((unit) => (
    <Link key={unit.slug} href={`${base}/gites/${unit.slug}`} className="menu-link">
      {unit.name}
    </Link>
  ));

  const unitCards = units.map((unit) => (
    <Link key={unit.slug} href={`${base}/gites/${unit.slug}`} className="menu-card">
      <span className="menu-card-photo">
        <Image src={unit.photos[0]} alt="" fill sizes="192px" loading="eager" className="object-cover" />
      </span>
      <span className="label menu-card-name">{unit.name}</span>
      <CueArrow className="menu-card-cue" />
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-line bg-background">
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--page-margin)]">
        <div>
          <LocaleSwitcher locale={locale} label={dict.nav.language} />
        </div>

        <Link href={base} aria-label={business.name}>
          <Image src="/brand/logo-pieds.svg" alt="" width={64} height={64} className="header-logo" priority />
        </Link>

        <div className="flex items-center justify-end gap-6">
          <nav className="label hidden items-center gap-6 lg:flex">
            <a {...beachLinkProps}>
              <RollingLabel text={dict.nav.beach} />
            </a>
            <Dropdown label={<RollingLabel text={dict.nav.units} />} openOnHover panelClassName="gap-3 p-3">
              {unitCards}
            </Dropdown>
            <Link href={contactHref}>
              <RollingLabel text={dict.nav.contact} />
            </Link>
          </nav>
          <Dropdown label={dict.nav.menu} className="lg:hidden" summaryClassName="rounded border border-line px-3 text-sm">
            <a {...beachLinkProps} className="menu-link">
              {dict.nav.beach}
            </a>
            <p className="px-2 pt-2 text-xs text-muted">{dict.nav.units}</p>
            {unitLinks}
            <Link href={contactHref} className="menu-link">
              {dict.nav.contact}
            </Link>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
