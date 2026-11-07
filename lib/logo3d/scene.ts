import {
  DirectionalLight,
  HemisphereLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { buildLogoModel } from "./model";

const CAMERA_DISTANCE = 8.4;
const SWAY_ANGLE = 0.28;
const SWAY_SPEED = 0.6;
const BOB_HEIGHT = 0.04;
const BOB_SPEED = 1.1;
const MAX_PIXEL_RATIO = 2;
const SHADOW_MAP_SIZE = 1024;
// Measured on the render: this value, without tone mapping, lands on the flat logo colours.
const LIGHT_SCALE = 2;

export interface LogoScene {
  resume: () => void;
  pause: () => void;
  destroy: () => void;
}

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    return renderer;
  } catch {
    // Expected on devices without WebGL: the flat logo simply stays in place.
    return null;
  }
}

function addLights(scene: Scene): void {
  scene.add(new HemisphereLight(0xfff6e8, 0x1d3a4d, 0.7 * LIGHT_SCALE));

  const key = new DirectionalLight(0xffffff, 1.5 * LIGHT_SCALE);
  key.position.set(-3, 4, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20 });
  scene.add(key);

  const fill = new DirectionalLight(0x9fdcdc, 0.45 * LIGHT_SCALE);
  fill.position.set(4, -1, 3);
  scene.add(fill);
}

export function createLogoScene(canvas: HTMLCanvasElement, animate: boolean): LogoScene | null {
  const renderer = createRenderer(canvas);
  if (!renderer) return null;

  const scene = new Scene();
  addLights(scene);
  const model = buildLogoModel();
  scene.add(model.root);

  const camera = new PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0.18, 0.1, 1).normalize().multiplyScalar(CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);

  const startedAt = performance.now();
  let frame = 0;

  const draw = (): void => {
    if (animate) {
      const seconds = (performance.now() - startedAt) / 1000;
      model.root.rotation.y = SWAY_ANGLE * Math.sin(seconds * SWAY_SPEED);
      model.root.position.y = BOB_HEIGHT * Math.sin(seconds * BOB_SPEED);
      model.animateShore(seconds);
    }
    renderer.render(scene, camera);
  };

  const loop = (): void => {
    draw();
    frame = requestAnimationFrame(loop);
  };

  const pause = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  return {
    resume: () => {
      if (!animate) draw();
      else if (!frame) loop();
    },
    pause,
    destroy: () => {
      pause();
      model.destroy();
      renderer.dispose();
    },
  };
}
