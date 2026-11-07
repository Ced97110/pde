import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { business, lodgingStructuredData } from "@/content/business";
import { getDictionary, isLocale, locales } from "@/content/dictionaries";
import type { Locale } from "@/content/dictionaries";

const textFont = Inter({
  variable: "--font-text",
  subsets: ["latin"],
  fallback: ["Arial", "sans-serif"],
});

// Licensed web font: see app/fonts/LICENSE-NeoSaphion.txt.
const neoSaphion = localFont({
  src: "../fonts/NeoSaphion-Light.woff2",
  variable: "--font-title",
  weight: "300",
  fallback: ["Times New Roman", "serif"],
});

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    title: `${business.name} — ${dict.hero.subtitle}`,
    description: dict.home.introText,
  };
}

export default async function LocaleLayout({
  params,
  children,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  // Escapes "<" so business data can never close the script tag.
  const structuredData = JSON.stringify(lodgingStructuredData(locale)).replace(/</g, "\\u003c");

  return (
    <html
      lang={locale}
      className={`${textFont.variable} ${neoSaphion.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <Header locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
