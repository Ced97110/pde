import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/content/dictionaries";
import { getGalleryImages } from "@/lib/gallery";
import { Gallery } from "@/components/Gallery";

export default async function GalleryPage({ params }: PageProps<"/[locale]/galerie">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const images = getGalleryImages();

  return (
    <div className="page">
      <h1 className="text-persienne">{dict.nav.gallery}</h1>
      <div id="gallery" className="mt-5">
        <Gallery images={images} closeLabel={dict.gallery.close} />
      </div>
    </div>
  );
}
