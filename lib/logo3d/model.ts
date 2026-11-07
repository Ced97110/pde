import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DataTexture,
  ExtrudeGeometry,
  Group,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  Path,
  RGBAFormat,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { LOGO_FEET_SVG, LOGO_TEXT_SVG } from "./paths";

// The model uses the logo's own SVG coordinates: 560 units wide, centred on (280, 280), y pointing down.
const CENTRE = 280;
const WAVE_START_X = 130;
const WAVE_WIDTH = 300;
const WAVE_MIN_Y = 240;
const WAVE_RANGE_Y = 60;
const STAR_POINTS: Array<[number, number]> = [
  [0, -20], [5, -6], [19, -6], [8, 3], [12, 17], [0, 8], [-12, 17], [-8, 3], [-19, -6], [-5, -6],
];

const standard = (color: string, roughness: number, metalness = 0): MeshStandardMaterial =>
  new MeshStandardMaterial({ color: new Color(color), roughness, metalness });

function disc(radius: number): Shape {
  const shape = new Shape();
  shape.absarc(CENTRE, CENTRE, radius, 0, Math.PI * 2, false);
  return shape;
}

function svgShapes(markup: string): Shape[] {
  return new SVGLoader().parse(markup).paths.flatMap((path) => path.toShapes());
}

function isInsideDisc(point: Vector2, radius: number): boolean {
  return Math.hypot(point.x - CENTRE, point.y - CENTRE) <= radius;
}

function shoreline(): Vector2[] {
  const wave = new Path();
  wave.moveTo(130, 270);
  wave.bezierCurveTo(165, 252, 195, 280, 230, 268);
  wave.bezierCurveTo(262, 257, 290, 282, 325, 270);
  wave.bezierCurveTo(360, 258, 390, 280, 430, 264);
  return wave.getPoints(120);
}

// Shoreline points inside the sand disc, closed by the bottom arc of that disc.
function waterShape(points: Vector2[]): Shape {
  const radius = 132;
  const inside = points.filter((point) => isInsideDisc(point, radius));
  const water = new Shape();
  water.moveTo(inside[0].x, inside[0].y);
  inside.slice(1).forEach((point) => water.lineTo(point.x, point.y));

  const last = inside[inside.length - 1];
  const start = Math.atan2(last.y - CENTRE, last.x - CENTRE);
  const rawEnd = Math.atan2(inside[0].y - CENTRE, inside[0].x - CENTRE);
  const end = rawEnd < start ? rawEnd + Math.PI * 2 : rawEnd;
  for (let step = 1; step <= 80; step += 1) {
    const angle = start + ((end - start) * step) / 80;
    water.lineTo(CENTRE + radius * Math.cos(angle), CENTRE + radius * Math.sin(angle));
  }
  return water;
}

function starShape(): Shape {
  const angle = (-12 * Math.PI) / 180;
  const star = new Shape();
  STAR_POINTS.forEach(([x, y], index) => {
    const px = 204 + x * Math.cos(angle) - y * Math.sin(angle);
    const py = 212 + x * Math.sin(angle) + y * Math.cos(angle);
    if (index === 0) star.moveTo(px, py);
    else star.lineTo(px, py);
  });
  return star;
}

function ripple(...coordinates: number[]): Vector2[] {
  const path = new Path();
  path.moveTo(coordinates[0], coordinates[1]);
  for (let index = 2; index < coordinates.length; index += 6) {
    const [a, b, c, d, e, f] = coordinates.slice(index, index + 6);
    path.bezierCurveTo(a, b, c, d, e, f);
  }
  return path.getPoints(24);
}

// Stores the shoreline height per x, so the shader can colour the feet above and below the water.
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

function feetMaterial(shore: DataTexture): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ roughness: 0.6 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      waveTex: { value: shore },
      uSand: { value: new Color("#FDF6EA") },
      uWater: { value: new Color("#8ED2CC") },
    });
    shader.vertexShader = `varying vec2 vSvg;\n${shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvSvg = position.xy;",
    )}`;
    shader.fragmentShader = `varying vec2 vSvg;\nuniform sampler2D waveTex;\nuniform vec3 uSand;\nuniform vec3 uWater;\n${shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      float wy = ${WAVE_MIN_Y.toFixed(1)} + ${WAVE_RANGE_Y.toFixed(1)} * texture2D(waveTex, vec2(clamp((vSvg.x - ${WAVE_START_X.toFixed(1)}) / ${WAVE_WIDTH.toFixed(1)}, 0.0, 1.0), 0.5)).r;
      diffuseColor.rgb = vSvg.y < wy ? uSand : uWater;`,
    )}`;
  };
  return material;
}

export interface LogoModel {
  root: Group;
  destroy: () => void;
}

export function buildLogoModel(): LogoModel {
  const logo = new Group();
  logo.position.set(-CENTRE, -CENTRE, 0);
  const root = new Group();
  root.rotation.x = Math.PI;
  root.scale.setScalar(0.01);
  root.add(logo);

  const add = (geometry: BufferGeometry, material: Material): Mesh => {
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    logo.add(mesh);
    return mesh;
  };
  // A layer of height `top` sits at z = -top, which the half-turn of `root` brings towards the camera.
  const layer = (shapes: Shape | Shape[], top: number, depth: number, bevel: number, material: Material, curveSegments = 24): void => {
    const geometry = new ExtrudeGeometry(shapes, {
      depth: Math.max(0.1, depth - 2 * bevel),
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments,
    });
    add(geometry, material).position.z = -top + bevel;
  };
  const tube = (points: Vector2[], radius: number, z: number, color: string): void => {
    const material = standard(color, 0.4);
    const path = points.map((point) => new Vector3(point.x, point.y, -z));
    add(new TubeGeometry(new CatmullRomCurve3(path), path.length * 2, radius, 10, false), material);
    [path[0], path[path.length - 1]].forEach((end) => {
      add(new SphereGeometry(radius, 12, 8), material).position.copy(end);
    });
  };

  layer(disc(204), 30, 30, 6, standard("#14324A", 0.42, 0.08), 96);
  add(new TorusGeometry(199, 2, 12, 200), standard("#F5ECDC", 0.35)).position.set(CENTRE, CENTRE, -30);
  [103, 457].forEach((x) => {
    const dot = add(new SphereGeometry(5, 24, 16), standard("#E8714F", 0.45));
    dot.position.set(x, CENTRE, -30);
    dot.scale.z = 0.7;
  });

  layer(svgShapes(LOGO_TEXT_SVG), 33.5, 4.5, 0, standard("#F5ECDC", 0.38), 12);
  layer(disc(133), 40, 14, 2, standard("#F3E3C6", 0.92), 96);

  const shore = shoreline();
  const shoreTexture = shorelineTexture(shore);
  layer(waterShape(shore), 42, 4, 0, standard("#23A3A3", 0.12, 0.15));
  layer(svgShapes(LOGO_FEET_SVG), 43.6, 5.6, 0.6, feetMaterial(shoreTexture));

  tube(shore.filter((point) => isInsideDisc(point, 131)), 2.5, 42.2, "#FDF6EA");
  tube(ripple(158, 318, 172, 310, 186, 318, 200, 310), 1.75, 42.1, "#8FD3D3");
  tube(ripple(360, 330, 374, 322, 388, 330, 402, 322), 1.75, 42.1, "#8FD3D3");
  tube(ripple(236, 392, 256, 384, 276, 392, 296, 384, 310, 378, 322, 384, 330, 380), 1.75, 42.1, "#8FD3D3");
  layer(starShape(), 49, 9, 2.6, standard("#E8714F", 0.5));

  const destroy = (): void => {
    shoreTexture.dispose();
    logo.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry.dispose();
      (object.material as Material).dispose();
    });
  };

  return { root, destroy };
}
