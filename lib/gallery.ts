import { readdirSync } from "node:fs";
import path from "node:path";

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "gallery");

export function getGalleryImages(): string[] {
  return readdirSync(GALLERY_DIR)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort()
    .map((file) => `/images/gallery/${file}`);
}
