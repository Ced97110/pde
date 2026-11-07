import Image from "next/image";

interface BeachParallaxProps {
  src: string;
  alt: string;
}

// The photo stays fixed between two curtains: the manifesto lifts off it, then the gîtes rise over it.
// Pure CSS sticky positioning, so it follows the scroll exactly and needs no script.
export function BeachParallax({ src, alt }: BeachParallaxProps) {
  return (
    <div className="beach-stage">
      <section className="beach sticky top-0 h-svh overflow-hidden">
        <div className="beach-media">
          <Image src={src} alt={alt} fill sizes="(min-width: 768px) 100vw, 300vw" className="object-cover object-[36%_50%]" />
        </div>
      </section>
    </div>
  );
}
