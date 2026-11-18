"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  url: string;
  title: string;
  portrait?: boolean; // true pour une vidéo verticale (appli mobile)
  onClose: () => void;
};

type Embed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string };

function getEmbed(url: string): Embed {
  // YouTube : watch?v=, youtu.be/, shorts/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`,
    };
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`,
    };
  }

  // Google Drive
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) {
    return {
      kind: "iframe",
      src: `https://drive.google.com/file/d/${drive[1]}/preview`,
    };
  }

  // Fichier local (.mp4 / .webm) ou autre lien direct
  return { kind: "file", src: url };
}

export function VideoModal({ url, title, portrait, onClose }: Props) {
  const embed = getEmbed(url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const frameClass = portrait
    ? "aspect-[9/16] h-[80vh] max-w-full"
    : "aspect-video w-full max-w-4xl";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Démo vidéo : ${title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between gap-4 text-white">
          <p className="truncate text-sm font-semibold sm:text-base">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la vidéo"
            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`overflow-hidden rounded-2xl bg-black shadow-2xl ${frameClass}`}>
          {embed.kind === "iframe" ? (
            <iframe
              src={embed.src}
              title={`Démo : ${title}`}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video
              src={embed.src}
              className="h-full w-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}