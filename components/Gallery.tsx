import Image from "next/image";
import { business } from "@/content/business";

interface GalleryProps {
  images: string[];
  closeLabel: string;
  altPrefix?: string;
}

export function Gallery({ images, closeLabel, altPrefix = business.name }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((src, index) => {
        const anchorId = `photo-${index}`;
        const alt = `${altPrefix}, Sainte-Anne — photo ${index + 1}`;

        return (
          <div key={src}>
            <a href={`#${anchorId}`} className="relative block aspect-[3/2] overflow-hidden">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition duration-300 hover:scale-[1.03]"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </a>

            <div id={anchorId} className="lightbox">
              <a href="#gallery" className="lightbox-close" aria-label={closeLabel}>
                ×
              </a>
              <div className="absolute inset-6">
                <Image src={src} alt={alt} fill className="object-contain" sizes="95vw" loading="lazy" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
