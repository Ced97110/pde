import { describe, expect, it } from "vitest";
import { buildStarfishGeometry, STARFISH_RADIUS } from "../starfish";

const geometry = buildStarfishGeometry();
const positions = geometry.getAttribute("position");
const points = Array.from({ length: positions.count }, (_, index) => ({
  x: positions.getX(index),
  y: positions.getY(index),
  height: -positions.getZ(index),
}));

describe("buildStarfishGeometry", () => {
  it("has five arms", () => {
    const sectors = Array.from({ length: 72 }, () => 0);
    points.forEach(({ x, y }) => {
      const sector = Math.floor((((Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 72) % 72;
      sectors[sector] = Math.max(sectors[sector], Math.hypot(x, y));
    });
    const peaks = sectors.filter((radius, index) => {
      const before = sectors[(index + 71) % 72];
      const after = sectors[(index + 1) % 72];
      return radius > before && radius >= after && radius > STARFISH_RADIUS * 0.7;
    });
    expect(peaks).toHaveLength(5);
  });

  it("is a rounded body rather than a flat top", () => {
    const highest = Math.max(...points.map(({ height }) => height));
    const heightsAt = (from: number, to: number): number[] =>
      points.filter(({ x, y }) => Math.hypot(x, y) >= from && Math.hypot(x, y) < to).map(({ height }) => height);
    expect(highest).toBeGreaterThan(10);
    expect(Math.max(...heightsAt(STARFISH_RADIUS * 0.5, STARFISH_RADIUS * 0.55))).toBeLessThan(highest - 3);
  });

  it("rises from the sand at its edge", () => {
    const edge = points.filter(({ x, y }) => Math.hypot(x, y) > STARFISH_RADIUS * 0.97);
    expect(edge.length).toBeGreaterThan(0);
    edge.forEach(({ height }) => expect(height).toBeLessThan(4));
  });

  it("stays inside its radius and faces the camera", () => {
    points.forEach(({ x, y }) => expect(Math.hypot(x, y)).toBeLessThanOrEqual(STARFISH_RADIUS + 0.01));
    const normals = geometry.getAttribute("normal");
    expect(normals.getZ(0)).toBeLessThan(0);
  });
});
