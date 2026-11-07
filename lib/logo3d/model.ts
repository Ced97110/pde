import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { LOGO_COLORS } from "./palette";
import { LOGO_FEET_SVG, LOGO_TEXT_SVG } from "./paths";
import { createShore } from "./shoreShader";

// The model uses the logo's own SVG coordinates: 560 units wide, centred on (280, 280), y pointing down.
const CENTRE = 280;
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

export interface LogoModel {
  root: Group;
  animateShore: (seconds: number) => void;
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
  const layer = (shapes: Shape | Shape[], top: number, depth: number, bevel: number, material: Material, curveSegments = 24): Mesh => {
    const geometry = new ExtrudeGeometry(shapes, {
      depth: Math.max(0.1, depth - 2 * bevel),
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments,
    });
    const mesh = add(geometry, material);
    mesh.position.z = -top + bevel;
    return mesh;
  };
  // The depth pass does not know the shoreline, so these moving lines cast no shadow.
  const tube = (points: Vector2[], radius: number, z: number, material: MeshStandardMaterial): void => {
    const path = points.map((point) => new Vector3(point.x, point.y, -z));
    add(new TubeGeometry(new CatmullRomCurve3(path), path.length * 2, radius, 10, false), material).castShadow = false;
    [path[0], path[path.length - 1]].forEach((end) => {
      add(new SphereGeometry(radius, 12, 8).translate(end.x, end.y, end.z), material).castShadow = false;
    });
  };

  layer(disc(204), 30, 30, 6, standard(LOGO_COLORS.ring, 0.42, 0.08), 96);
  add(new TorusGeometry(199, 3, 12, 200), standard(LOGO_COLORS.trim, 0.35)).position.set(CENTRE, CENTRE, -30);
  [103, 457].forEach((x) => {
    const dot = add(new SphereGeometry(5, 24, 16), standard(LOGO_COLORS.trim, 0.45));
    dot.position.set(x, CENTRE, -30);
    dot.scale.z = 0.7;
  });

  layer(svgShapes(LOGO_TEXT_SVG), 33.5, 4.5, 0, standard(LOGO_COLORS.text, 0.38), 12);
  const line = shoreline();
  const shore = createShore(line);
  layer(disc(133), 40, 14, 2, shore.bind(standard(LOGO_COLORS.sand, 0.92), "sand"), 96);
  // A full disc, cut along the moving shoreline by its shader, so it casts no shadow on the sand.
  layer(disc(132), 42, 4, 0, shore.bind(standard(LOGO_COLORS.water, 0.12, 0.15), "water"), 96).castShadow = false;
  layer(svgShapes(LOGO_FEET_SVG), 43.6, 5.6, 0.6, shore.bind(new MeshStandardMaterial({ roughness: 0.6 }), "feet"));

  tube(line.filter((point) => isInsideDisc(point, 131)), 2.5, 42.2, shore.bind(standard(LOGO_COLORS.foam, 0.4), "line"));
  tube(ripple(158, 318, 172, 310, 186, 318, 200, 310), 1.75, 42.1, shore.bind(standard(LOGO_COLORS.ripple, 0.4), "ripple"));
  tube(ripple(360, 330, 374, 322, 388, 330, 402, 322), 1.75, 42.1, shore.bind(standard(LOGO_COLORS.ripple, 0.4), "ripple"));
  tube(ripple(236, 392, 256, 384, 276, 392, 296, 384, 310, 378, 322, 384, 330, 380), 1.75, 42.1, shore.bind(standard(LOGO_COLORS.ripple, 0.4), "ripple"));
  layer(starShape(), 49, 9, 2.6, standard(LOGO_COLORS.star, 0.5));

  const destroy = (): void => {
    shore.destroy();
    logo.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.geometry.dispose();
      (object.material as Material).dispose();
    });
  };

  return { root, animateShore: shore.update, destroy };
}
