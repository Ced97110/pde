import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { seasons, weeklyRates, policies } from "@/content/pricing";
import { getUnitBySlug } from "@/content/units";

export default async function PricingPage({ params }: PageProps<"/[locale]/tarifs">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.pricing.title}</h1>
      <p className="mt-5">{dict.pricing.subtitle}</p>

      <div className="mt-16">
        <table className="pricing-table w-full border-collapse border border-line text-sm">
          <thead className="bg-surface-alt text-left text-persienne">
            <tr>
              <th className="px-4 py-3">{dict.pricing.unit}</th>
              <th className="px-4 py-3">{dict.pricing.capacity}</th>
              {seasons.map((season) => (
                <th key={season.key} className="px-4 py-3">
                  {season.label[locale]}
                  <div className="font-light text-muted">
                    {season.dateRange[locale]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyRates.map((rate) => {
              const unit = getUnitBySlug(rate.unitSlug);
              return (
                <tr key={rate.unitSlug} className="border-t border-line">
                  <td className="px-4 py-3">{unit?.name ?? rate.unitSlug}</td>
                  <td className="px-4 py-3" data-label={dict.pricing.capacity}>
                    <span>{rate.capacity}</span>
                  </td>
                  {seasons.map((season) => (
                    <td
                      key={season.key}
                      className="px-4 py-3"
                      data-label={season.label[locale]}
                      data-dates={season.dateRange[locale]}
                    >
                      <span>
                        {rate[season.key]} € / {dict.pricing.perWeek}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-16 grid gap-x-3 gap-y-16 sm:grid-cols-2">
        <div>
          <h2 className="text-persienne">{dict.pricing.discountsTitle}</h2>
          <ul className="mt-5 space-y-1">
            {policies.longStayDiscounts.map((discount) => (
              <li key={discount.weeks}>
                {dict.pricing.discount(discount.weeks, discount.discountPercent)}
              </li>
            ))}
          </ul>
          <ul className="mt-5 space-y-1">
            <li>{dict.pricing.minStay}</li>
            <li>{dict.pricing.deposit}</li>
            <li>
              {dict.pricing.cleaningFee} : {policies.cleaningFeeEur} €
            </li>
            <li>
              {dict.pricing.touristTax} : {policies.touristTaxPerAdultPerNightEur.toFixed(2).replace(".", locale === "fr" ? "," : ".")} €
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-persienne">{dict.pricing.includedTitle}</h2>
          <ul className="mt-5 space-y-1">
            {policies.includedServices[locale].map((service) => (
              <li key={service}>
                {service}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
