import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_TEXT_SVG } from "../paths";
import { LOGO_COLORS } from "../palette";

const flatLogo = readFileSync("public/brand/logo-pieds.svg", "utf8");
const FOOTER_BACKGROUND = "#0B3A3D";

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe("logo palette", () => {
  it("uses the same colours on the flat logo as on the 3D one", () => {
    const { foam, name, sand, star, water, ripple, submerged } = LOGO_COLORS;
    [foam, name, sand, star, water, ripple, submerged].forEach((color) => {
      expect(flatLogo.toUpperCase()).toContain(color.toUpperCase());
    });
  });

  it("drops the old navy and beige", () => {
    ["#14324A", "#F3E3C6", "#F5ECDC"].forEach((color) => expect(flatLogo).not.toContain(color));
  });

  it("shows the circle by itself, without the green ring", () => {
    expect(flatLogo).not.toContain("#0B6B4B");
    expect(flatLogo).not.toContain('r="210"');
    expect(flatLogo).toContain('viewBox="122 104 316 316"');
  });

  it("curves the business name alone along the top of the circle", () => {
    [flatLogo, LOGO_TEXT_SVG].forEach((markup) => {
      expect(markup.match(/scale\(0\.04000/g)).toHaveLength(17);
      expect(markup).not.toContain("scale(0.02500");
    });
  });

  it("keeps the name readable on the white header and the dark footer", () => {
    expect(contrast(LOGO_COLORS.name, "#FFFFFF")).toBeGreaterThanOrEqual(3);
    expect(contrast(LOGO_COLORS.name, FOOTER_BACKGROUND)).toBeGreaterThanOrEqual(3);
  });
});
