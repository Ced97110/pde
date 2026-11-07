// How the shoreline moves, in logo units. Negative shifts carry the line up the beach.
export const SWASH_PERIOD = 8;

const RUSH_SHARE = 0.26;
const RETREAT = 7;
const RUN_UP = 21;
const CALM_CHOP = 0.7;
const RUSH_CHOP = 0.5;

export interface ShoreState {
  shift: number;
  // How far up the sand the last wave reached, as a shift.
  reachShift: number;
  // 1 just after a wave peaks, fading to 0 as the sand dries.
  wetness: number;
  chop: number;
}

export const STILL_SHORE: ShoreState = { shift: 0, reachShift: 0, wetness: 0, chop: 0 };

const fraction = (value: number): number => value - Math.floor(value);
const smooth = (value: number): number => value * value * (3 - 2 * value);
const toShift = (swash: number): number => RETREAT - (RETREAT + RUN_UP) * swash;

// Seeded so that each wave differs, while any moment can be computed on its own.
const waveStrength = (cycle: number): number => 0.62 + 0.38 * fraction(Math.sin(cycle * 12.9898) * 43758.5453);

export function shoreState(seconds: number): ShoreState {
  const progress = seconds / SWASH_PERIOD;
  const cycle = Math.floor(progress);
  const phase = progress - cycle;
  const rushing = phase < RUSH_SHARE;

  const swash = rushing
    ? waveStrength(cycle) * smooth(phase / RUSH_SHARE)
    : waveStrength(cycle) * (0.5 + 0.5 * Math.cos((Math.PI * (phase - RUSH_SHARE)) / (1 - RUSH_SHARE)));
  const lastPeak = waveStrength(rushing ? cycle - 1 : cycle);
  const sincePeak = rushing ? phase + 1 - RUSH_SHARE : phase - RUSH_SHARE;

  return {
    shift: toShift(swash),
    reachShift: toShift(Math.max(swash, lastPeak)),
    wetness: 1 - sincePeak,
    chop: CALM_CHOP + RUSH_CHOP * swash,
  };
}
