"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
};

export function ImageCarousel({ images, alt }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (total === 0) return null;

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="group relative">
      {/* Piste de défilement : glisser au doigt / à la souris */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="relative aspect-[4/5] w-full min-w-full snap-center"
          >
            <Image
              src={src}
              alt={`${alt} - photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          {/* Compteur 1/3 */}
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {index + 1}/{total}
          </span>

          {/* Flèche précédente */}
          {index > 0 && (
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow transition hover:bg-white"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Flèche suivante */}
          {index < total - 1 && (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow transition hover:bg-white"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Points en bas, comme Instagram */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller à la photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}