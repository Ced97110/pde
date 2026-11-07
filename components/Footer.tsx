import Link from "next/link";
import { business } from "@/content/business";
import type { Dictionary, Locale } from "@/content/dictionaries";
import { FooterLogo } from "./FooterLogo";
import { RollingLabel } from "./RollingLabel";

// Three times the 64px header logo.
const LOGO_SIZE = 192;

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

// Computed once at build time (module scope), not per-render, so static
// prerendering under Cache Components stays deterministic.
const year = new Date().getFullYear();

export function Footer({ locale, dict }: FooterProps) {
  const base = `/${locale}`;
  const pages = [
    { href: `${base}/galerie`, label: dict.nav.gallery },
    { href: `${base}/tarifs`, label: dict.nav.pricing },
    { href: `${base}/situation`, label: dict.nav.location },
    { href: `${base}/avis`, label: dict.nav.reviews },
  ];

  return (
    <footer className="bg-persienne text-white">
      <div className="flex min-h-[60svh] flex-col justify-between gap-12 px-[var(--page-margin)] py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-3">
          <FooterLogo alt={business.name} size={LOGO_SIZE} />

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-3">
            <nav className="label flex flex-col items-start">
              {pages.map((page) => (
                <Link key={page.href} href={page.href} className="py-1.5">
                  <RollingLabel text={page.label} />
                </Link>
              ))}
            </nav>

            <address className="flex flex-col items-start gap-1 not-italic">
              <span>{business.address.street}</span>
              <span>
                {business.address.postalCode} {business.address.city}, {business.address.region}
              </span>
              <a href={`tel:${business.contact.phone.replaceAll(" ", "")}`} className="mt-3 py-0.5 underline underline-offset-4">
                {business.contact.phoneDisplay}
              </a>
              <a href={`mailto:${business.contact.email}`} className="break-all py-0.5 underline underline-offset-4">
                {business.contact.email}
              </a>
            </address>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-4 text-sm text-white/80">
          <span>
            © {year} {business.name}. {dict.footer.rights}
          </span>
          <Link href={`/${locale}/mentions-legales`} className="py-0.5 underline underline-offset-4">
            {dict.footer.legalNotice}
          </Link>
        </div>
      </div>
    </footer>
  );
}
