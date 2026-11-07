import { describe, expect, it } from "vitest";
import { STILL_SHORE, SWASH_PERIOD, shoreState } from "../shore";

const STEP = 1 / 60;
const sample = (from: number, to: number): number[] =>
  Array.from({ length: Math.ceil((to - from) / STEP) }, (_, index) => from + index * STEP);

// Negative shifts carry the line up the beach, so a wave's peak is its lowest value.
const cycleShifts = (cycle: number): Array<{ at: number; shift: number }> =>
  sample(cycle * SWASH_PERIOD, (cycle + 1) * SWASH_PERIOD).map((at) => ({ at, shift: shoreState(at).shift }));

describe("shoreState", () => {
  it("leaves the logo untouched when the shore is still", () => {
    expect(STILL_SHORE).toEqual({ shift: 0, reachShift: 0, wetness: 0, chop: 0 });
  });

  it("rushes up the beach faster than it drains back", () => {
    const shifts = cycleShifts(3);
    const peak = shifts.reduce((best, entry) => (entry.shift < best.shift ? entry : best));
    const start = shifts[0].at;
    const end = shifts[shifts.length - 1].at;
    expect(peak.at - start).toBeLessThan((end - peak.at) / 2);
  });

  it("never jumps between two frames", () => {
    const shifts = sample(0, SWASH_PERIOD * 12).map((at) => shoreState(at).shift);
    shifts.slice(1).forEach((shift, index) => {
      expect(Math.abs(shift - shifts[index])).toBeLessThan(1);
    });
  });

  it("gives each wave its own reach", () => {
    const peaks = [0, 1, 2, 3, 4, 5].map((cycle) => Math.min(...cycleShifts(cycle).map(({ shift }) => shift)));
    expect(new Set(peaks.map((peak) => peak.toFixed(1))).size).toBeGreaterThan(3);
  });

  it("keeps the wet line at or above the water, and lets it dry", () => {
    sample(0, SWASH_PERIOD * 6).forEach((at) => {
      const { shift, reachShift, wetness } = shoreState(at);
      expect(reachShift).toBeLessThanOrEqual(shift);
      expect(wetness).toBeGreaterThanOrEqual(0);
      expect(wetness).toBeLessThanOrEqual(1);
    });
    const shifts = cycleShifts(2);
    const peak = shifts.reduce((best, entry) => (entry.shift < best.shift ? entry : best));
    expect(shoreState(peak.at + SWASH_PERIOD / 2).wetness).toBeLessThan(shoreState(peak.at + 0.1).wetness);
  });

  it("works for any time, including before the first wave", () => {
    [-3, 0, 1e6].forEach((at) => expect(Number.isFinite(shoreState(at).shift)).toBe(true));
  });
});
