import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import { LOGO_COLORS } from "./palette";

// A sculpted starfish in logo units, centred on the origin. Height runs towards -z, the camera side.
export const STARFISH_RADIUS = 25;

const ARMS = 5;
const ARM_STEP = (Math.PI * 2) / ARMS;
const ARM_LENGTHS = [1, 0.93, 0.98, 0.91, 0.96];
const FIRST_ARM = (-102 * Math.PI) / 180;
const INNER_RADIUS = 8.5;
const BODY_HEIGHT = 15;
const TIP_TAPER = 0.6;
const BUMP_HEIGHT = 1.1;
const BUMP_ALONG = 5;
const BUMP_ACROSS = 4;
const RINGS = 40;
const SEGMENTS = 260;

interface SurfacePoint {
  x: number;
  y: number;
  height: number;
  bump: number;
}

function surfacePoint(ring: number, segment: number): SurfacePoint {
  const theta = (segment / SEGMENTS) * Math.PI * 2;
  const turns = (theta - FIRST_ARM) / ARM_STEP;
  const arm = Math.round(turns);
  const offset = (turns - arm) * ARM_STEP;
  // 1 along an arm's axis, 0 in the valley between two arms, where the nearest arm changes.
  const onArm = Math.cos((offset * ARMS) / 2);
  const length = ARM_LENGTHS[((arm % ARMS) + ARMS) % ARMS];

  const armAngle = Math.abs(offset) / (ARM_STEP / 2);
  const edge = INNER_RADIUS + (STARFISH_RADIUS * length - INNER_RADIUS) * (1 - armAngle) ** 1.6 * (0.55 + 0.45 * onArm);
  const progress = ring / RINGS;
  const radius = progress * edge;
  const dome = Math.sqrt(1 - progress * progress);

  const along = radius * Math.cos(offset);
  const across = radius * Math.sin(offset);
  const lobe = Math.cos((along * Math.PI * 2) / BUMP_ALONG) * Math.cos((across * Math.PI * 2) / BUMP_ACROSS);
  const bump = Math.max(0, lobe) ** 2 * onArm * Math.min(1, radius / INNER_RADIUS);

  const taper = 1 - (TIP_TAPER * radius) / STARFISH_RADIUS;
  return {
    x: radius * Math.cos(theta),
    y: radius * Math.sin(theta),
    height: BODY_HEIGHT * dome * taper + BUMP_HEIGHT * bump * dome,
    bump,
  };
}

function pointColor({ height, bump }: SurfacePoint): Color {
  const deep = new Color(LOGO_COLORS.starDeep);
  const body = new Color(LOGO_COLORS.star);
  const crest = new Color(LOGO_COLORS.starLight);
  const shaded = new Color().lerpColors(deep, body, Math.min(1, height / (BODY_HEIGHT * 0.2)));
  return shaded.lerp(crest, 0.4 * bump);
}

export function buildStarfishGeometry(): BufferGeometry {
  const summit = surfacePoint(0, 0);
  const rim = Array.from({ length: RINGS }, (_, ring) =>
    Array.from({ length: SEGMENTS }, (_unused, segment) => surfacePoint(ring + 1, segment)),
  ).flat();
  const surface = [summit, ...rim];

  const vertex = (ring: number, segment: number): number => 1 + ring * SEGMENTS + (segment % SEGMENTS);
  const faces: number[] = [];
  for (let segment = 0; segment < SEGMENTS; segment += 1) {
    faces.push(0, vertex(0, segment + 1), vertex(0, segment));
    for (let ring = 0; ring < RINGS - 1; ring += 1) {
      const [a, b, c, d] = [vertex(ring, segment), vertex(ring, segment + 1), vertex(ring + 1, segment), vertex(ring + 1, segment + 1)];
      faces.push(a, b, c, b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(surface.flatMap(({ x, y, height }) => [x, y, -height]), 3));
  geometry.setAttribute("color", new Float32BufferAttribute(surface.flatMap((point) => pointColor(point).toArray()), 3));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  return geometry;
}
