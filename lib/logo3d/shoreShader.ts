import { Color, DataTexture, LinearFilter, RGBAFormat, type MeshStandardMaterial, type Vector2 } from "three";
import { LOGO_COLORS } from "./palette";
import { shoreState, type ShoreState } from "./shore";

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

// Each role recolours the surface around the moving line; the water is cut along it.
const FRAGMENTS: Record<Exclude<ShoreRole, "line" | "ripple">, string> = {
  sand: `
    float reach = shoreRest(vSvg.x) + uReach + uChop * shoreChop(vSvg.x, 0.0);
    diffuseColor.rgb = mix(diffuseColor.rgb, uWetSand, uWet * smoothstep(reach - 2.5, reach + 2.5, vSvg.y));`,
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
  };
  const ripple = { uShift: { value: 0 }, uChop: { value: 0 } };

  const bind: Shore["bind"] = (material, role) => {
    material.customProgramCacheKey = () => (role === "ripple" ? "line" : role);
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared, role === "ripple" ? ripple : {});
      if (role === "line" || role === "ripple") {
        shader.vertexShader = `${CHOP_GLSL}\n${shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\ntransformed.y += uShift + uChop * shoreChop(position.x, uTime);",
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
${shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>${FRAGMENTS[role]}`)}`;
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
