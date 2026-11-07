"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { LogoScene } from "@/lib/logo3d/scene";

interface FooterLogoProps {
  alt: string;
  size: number;
}

// The flat logo stays underneath until the 3D one has drawn, and remains if WebGL is unavailable.
export function FooterLogo({ alt, size }: FooterLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: LogoScene | null = null;
    let loading = false;
    let disposed = false;

    const load = async (): Promise<void> => {
      loading = true;
      try {
        // Three.js is heavy: it is only fetched once the footer comes near.
        const { createLogoScene } = await import("@/lib/logo3d/scene");
        // Strict Mode mounts twice: only the live effect may claim the canvas.
        if (disposed) return;
        const created = createLogoScene(canvas, animate);
        if (!created) return;
        scene = created;
        created.resume();
        root.dataset.ready = "true";
        if (animate) root.dataset.animated = "true";
      } catch (error) {
        console.error("Footer logo: the 3D version failed, keeping the flat logo.", error);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) scene?.pause();
        else if (scene) scene.resume();
        else if (!loading) void load();
      },
      { rootMargin: "200px" },
    );
    observer.observe(root);

    const onContextLost = (): void => {
      scene?.pause();
      delete root.dataset.ready;
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene?.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className="footer-logo relative" style={{ width: size, height: size }}>
      <Image src="/brand/logo-pieds.svg" alt={alt} width={size} height={size} />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
