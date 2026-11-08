import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { units } from "@/content/units";
import { business } from "@/content/business";
import type { Dictionary, Locale } from "@/content/dictionaries";
import { Dropdown } from "./Dropdown";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { RollingLabel } from "./RollingLabel";
import { CueArrow } from "./CueArrow";
import { HoverNav } from "./HoverNav";

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function Header({ locale, dict }: HeaderProps) {
  const base = `/${locale}`;
  const contactHref = `${base}/contact`;
  const beachLinkProps = { href: business.beachGuideUrl, target: "_blank", rel: "noopener noreferrer" };
  const unitCards = units.map((unit, index) => (
    <Link
      key={unit.slug}
      href={`${base}/gites/${unit.slug}`}
      className="menu-card"
      style={{ "--card-index": index } as CSSProperties}
    >
      <span className="menu-card-photo">
        <Image src={unit.photos[0]} alt="" fill sizes="(min-width: 1024px) 192px, 30vw" loading="eager" className="object-cover" />
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
          <HoverNav className="label hidden items-center gap-6 lg:flex">
            <a {...beachLinkProps} className="py-2">
              <RollingLabel text={dict.nav.beach} />
            </a>
            <Dropdown label={<RollingLabel text={dict.nav.units} />} openOnHover panelClassName="menu-gallery gap-3 p-3">
              {unitCards}
            </Dropdown>
            <Link href={contactHref} className="py-2">
              <RollingLabel text={dict.nav.contact} />
            </Link>
          </HoverNav>
          <Dropdown
            label={
              <>
                <span className="sr-only menu-when-closed">{dict.nav.menu}</span>
                <span className="sr-only menu-when-open">{dict.nav.close}</span>
                <span className="menu-bars" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </>
            }
            variant="sheet"
            panelClassName=""
            className="lg:hidden"
            summaryClassName="menu-toggle"
          >
            <div className="menu-sheet-inner">
              <a {...beachLinkProps} className="menu-sheet-link title-type">
                {dict.nav.beach}
              </a>
              <div className="menu-sheet-units">
                <p className="label text-muted">{dict.nav.units}</p>
                <div className="menu-sheet-gallery">{unitCards}</div>
              </div>
              <Link href={contactHref} className="menu-sheet-link title-type">
                {dict.nav.contact}
              </Link>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
