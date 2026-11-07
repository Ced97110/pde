import { Color, DataTexture, LinearFilter, RGBAFormat, type MeshStandardMaterial, type Vector2 } from "three";
import { LOGO_COLORS } from "./palette";
import { shoreState, type ShoreState } from "./shore";

const DISC_CENTRE = 280;
const DISC_RADIUS = 132.5;
const WAVE_START_X = 130;
const WAVE_WIDTH = 300;
const WAVE_MIN_Y = 240;
const WAVE_RANGE_Y = 60;
// The swell reaches the ripples before the beach, and moves them less.
const RIPPLE_LEAD = 1.3;
const RIPPLE_GAIN = 0.45;
const RIPPLE_CHOP = 0.6;

export type ShoreRole = "sand" | "water" | "feet" | "line" | "ripple";

const CHOP_GLSL = `
uniform float uShift;
uniform float uChop;
uniform float uTime;
float shoreChop(float x, float t) {
  return 3.2 * sin(x * 0.021 + t * 0.55) + 1.7 * sin(x * 0.047 - t * 0.83) + 0.9 * sin(x * 0.093 + t * 1.3);
}`;

const LINE_GLSL = `
varying vec2 vSvg;
uniform sampler2D waveTex;
${CHOP_GLSL}
float shoreRest(float x) {
  float u = clamp((x - ${WAVE_START_X.toFixed(1)}) / ${WAVE_WIDTH.toFixed(1)}, 0.0, 1.0);
  return ${WAVE_MIN_Y.toFixed(1)} + ${WAVE_RANGE_Y.toFixed(1)} * texture2D(waveTex, vec2(u, 0.5)).r;
}
float shoreLine(float x) {
  return shoreRest(x) + uShift + uChop * shoreChop(x, uTime);
}`;

// Fixed to the disc: only the wet band moves, so the sand never reads as a video.
const SAND_GLSL = `
const mat2 SAND_TURN = mat2(0.8, 0.6, -0.6, 0.8);
float sandHash(vec2 cell) {
  vec3 mixed = fract(vec3(cell.xyx) * 0.1031);
  mixed += dot(mixed, mixed.yzx + 33.33);
  return fract((mixed.x + mixed.y) * mixed.z);
}
float sandNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 blend = smoothstep(0.0, 1.0, fract(point));
  float bottom = mix(sandHash(cell), sandHash(cell + vec2(1.0, 0.0)), blend.x);
  float top = mix(sandHash(cell + vec2(0.0, 1.0)), sandHash(cell + vec2(1.0, 1.0)), blend.x);
  return mix(bottom, top, blend.y);
}
// Each layer is turned, so no pattern lines up with the grid.
float sandLayers(vec2 point) {
  float wide = sandNoise(SAND_TURN * point);
  float mid = sandNoise(SAND_TURN * SAND_TURN * point * 2.3 + 17.0);
  float fine = sandNoise(SAND_TURN * SAND_TURN * SAND_TURN * point * 5.1 + 41.0);
  return 0.55 * wide + 0.3 * mid + 0.15 * fine;
}
// Wind ripples run along the shore, wandering so that no two ridges match.
float rippleHeight(vec2 point) {
  float upBeach = shoreRest(point.x) - point.y;
  float wander = 26.0 * sandNoise(SAND_TURN * point * 0.022) + 7.0 * sandNoise(SAND_TURN * point * 0.07);
  return sin((upBeach + wander) * 0.44);
}
// Lit by its own low sun, from the top left, so the scene lights keep the logo's colours.
float rippleShade(vec2 point) {
  const vec2 SUN = vec2(-0.6, -0.8);
  float rise = rippleHeight(point + SUN * 2.0) - rippleHeight(point - SUN * 2.0);
  return rise * smoothstep(12.0, 46.0, shoreRest(point.x) - point.y);
}`;

// The scene has no sky to reflect, so wet sand adds its own, fading as the sand dries.
const WET_SHEEN_GLSL = `
    totalEmissiveRadiance += uWetSky * 0.3 * wetBand * uWet * (0.4 + 1.2 * sandLayers(vSvg * 0.1));`;

// Each role recolours the surface around the moving line; the water is cut along it.
const FRAGMENTS: Record<Exclude<ShoreRole, "line" | "ripple">, string> = {
  sand: `
    float patches = sandLayers(vSvg * 0.03);
    float grain = sandLayers(vSvg * 0.75);
    vec3 drySand = mix(uSandDark, uSandLight, smoothstep(0.3, 0.7, patches));
    drySand = mix(drySand, uGrainDark, 0.28 * smoothstep(0.52, 0.72, grain));
    drySand = mix(drySand, uGrainLight, 0.4 * smoothstep(0.48, 0.3, grain));
    drySand *= 1.0 + 0.1 * rippleShade(vSvg);
    drySand = mix(drySand, uWetSand, 0.42 * (1.0 - smoothstep(6.0, 56.0, shoreRest(vSvg.x) - vSvg.y)));
    float reach = shoreRest(vSvg.x) + uReach + uChop * shoreChop(vSvg.x, 0.0) + 8.0 * (patches - 0.5);
    float wetBand = uWet * smoothstep(reach - 2.5, reach + 2.5, vSvg.y);
    diffuseColor.rgb = mix(drySand, uWetSand * (0.85 + 0.3 * patches), 0.9 * wetBand);`,
  water: `
    float depth = vSvg.y - shoreLine(vSvg.x);
    if (depth < 0.0) discard;
    float reach = 9.0 + 3.5 * sin(vSvg.x * 0.037 + uTime * 0.7) + 2.5 * sin(vSvg.x * 0.083 - uTime * 0.45);
    float foam = 1.0 - smoothstep(0.0, reach, depth);
    diffuseColor.rgb = mix(mix(uShallow, diffuseColor.rgb, smoothstep(0.0, 48.0, depth)), uFoam, 0.85 * foam);`,
  feet: `
    diffuseColor.rgb = vSvg.y < shoreLine(vSvg.x) ? uFoam : uSubmerged;`,
};

function shorelineTexture(points: Vector2[]): DataTexture {
  const size = 512;
  const data = new Uint8Array(size * 4);
  for (let index = 0; index < size; index += 1) {
    const x = WAVE_START_X + (WAVE_WIDTH * index) / (size - 1);
    let segment = 0;
    while (segment < points.length - 2 && points[segment + 1].x < x) segment += 1;
    const from = points[segment];
    const to = points[segment + 1];
    const ratio = Math.min(1, Math.max(0, (x - from.x) / (to.x - from.x || 1)));
    const y = from.y + (to.y - from.y) * ratio;
    data[index * 4] = Math.round(((y - WAVE_MIN_Y) / WAVE_RANGE_Y) * 255);
    data[index * 4 + 3] = 255;
  }
  const texture = new DataTexture(data, size, 1, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export interface Shore {
  // Teaches a material to follow the line. Mutates it: three.js has no other hook for this.
  bind: <T extends MeshStandardMaterial>(material: T, role: ShoreRole) => T;
  update: (seconds: number) => void;
  destroy: () => void;
}

export function createShore(points: Vector2[]): Shore {
  const texture = shorelineTexture(points);
  const shared = {
    waveTex: { value: texture },
    uTime: { value: 0 },
    uShift: { value: 0 },
    uChop: { value: 0 },
    uReach: { value: 0 },
    uWet: { value: 0 },
    uFoam: { value: new Color(LOGO_COLORS.foam) },
    uSubmerged: { value: new Color(LOGO_COLORS.submerged) },
    uShallow: { value: new Color(LOGO_COLORS.shallow) },
    uWetSand: { value: new Color(LOGO_COLORS.wetSand) },
    uSandLight: { value: new Color(LOGO_COLORS.sandLight) },
    uSandDark: { value: new Color(LOGO_COLORS.sandDark) },
    uGrainLight: { value: new Color(LOGO_COLORS.grainLight) },
    uGrainDark: { value: new Color(LOGO_COLORS.grainDark) },
    uWetSky: { value: new Color(LOGO_COLORS.wetSky) },
  };
  const ripple = { uShift: { value: 0 }, uChop: { value: 0 } };

  const bind: Shore["bind"] = (material, role) => {
    material.customProgramCacheKey = () => (role === "ripple" ? "line" : role);
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared, role === "ripple" ? ripple : {});
      if (role === "line" || role === "ripple") {
        shader.vertexShader = `varying vec2 vSvg;\n${CHOP_GLSL}\n${shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\ntransformed.y += uShift + uChop * shoreChop(position.x, uTime);\nvSvg = transformed.xy;",
        )}`;
        // Lines move vertically while the disc edge curves: cut them where they would leave the disc.
        shader.fragmentShader = `varying vec2 vSvg;\n${shader.fragmentShader.replace(
          "#include <color_fragment>",
          `#include <color_fragment>\nif (distance(vSvg, vec2(${DISC_CENTRE.toFixed(1)})) > ${DISC_RADIUS.toFixed(1)}) discard;`,
        )}`;
        return;
      }
      shader.vertexShader = `varying vec2 vSvg;\n${shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvSvg = position.xy;",
      )}`;
      shader.fragmentShader = `${LINE_GLSL}
uniform float uReach;
uniform float uWet;
uniform vec3 uFoam;
uniform vec3 uSubmerged;
uniform vec3 uShallow;
uniform vec3 uWetSand;
uniform vec3 uSandLight;
uniform vec3 uSandDark;
uniform vec3 uGrainLight;
uniform vec3 uGrainDark;
uniform vec3 uWetSky;
${SAND_GLSL}
${shader.fragmentShader
  .replace("#include <color_fragment>", `#include <color_fragment>${FRAGMENTS[role]}`)
  .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>${role === "sand" ? WET_SHEEN_GLSL : ""}`)}`;
    };
    return material;
  };

  const apply = ({ shift, reachShift, wetness, chop }: ShoreState, seconds: number): void => {
    shared.uTime.value = seconds;
    shared.uShift.value = shift;
    shared.uChop.value = chop;
    shared.uReach.value = reachShift;
    shared.uWet.value = wetness;
    ripple.uShift.value = RIPPLE_GAIN * shoreState(seconds + RIPPLE_LEAD).shift;
    ripple.uChop.value = RIPPLE_CHOP * chop;
  };

  return {
    bind,
    update: (seconds) => apply(shoreState(seconds), seconds),
    destroy: () => texture.dispose(),
  };
}
