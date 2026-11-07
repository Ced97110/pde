import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { units } from "@/content/units";
import { weeklyRates } from "@/content/pricing";
import { fr } from "@/content/dictionaries/fr";
import { en } from "@/content/dictionaries/en";

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];

  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    flattenKeys(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("units", () => {
  it("has three unique slugs", () => {
    const slugs = units.map((unit) => unit.slug);
    expect(slugs).toHaveLength(3);
    expect(new Set(slugs).size).toBe(3);
  });

  it("gives every unit a positive capacity and surface area", () => {
    for (const unit of units) {
      expect(unit.capacity).toBeGreaterThan(0);
      expect(unit.surfaceAreaM2).toBeGreaterThan(0);
    }
  });
});

describe("unit photos", () => {
  it("points every unit photo at a real file, with no photo shared between units", () => {
    const all = units.flatMap((unit) => unit.photos);
    expect(new Set(all).size).toBe(all.length);
    for (const src of all) {
      expect(existsSync(path.join(process.cwd(), "public", src))).toBe(true);
    }
  });
});

describe("pricing", () => {
  it("has exactly one weekly rate per unit", () => {
    const rateSlugs = weeklyRates.map((rate) => rate.unitSlug).sort();
    const unitSlugs = units.map((unit) => unit.slug).sort();
    expect(rateSlugs).toEqual(unitSlugs);
  });

  it("orders rates high >= mid >= low for every unit", () => {
    for (const rate of weeklyRates) {
      expect(rate.high).toBeGreaterThanOrEqual(rate.mid);
      expect(rate.mid).toBeGreaterThanOrEqual(rate.low);
    }
  });
});

describe("dictionaries", () => {
  it("keeps the same key structure between fr and en", () => {
    const frKeys = flattenKeys(fr).sort();
    const enKeys = flattenKeys(en).sort();
    expect(enKeys).toEqual(frKeys);
  });
});
