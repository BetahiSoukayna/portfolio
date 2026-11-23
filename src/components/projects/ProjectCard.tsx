"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Github, Play } from "lucide-react";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ImageCarousel } from "@/components/ImageCarousel";
import { VideoModal } from "./VideoModal";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const isMobile = project.deviceType === "mobile";
  const screenshots = project.screenshots || [];
  const [showVideo, setShowVideo] = useState(false);
  const hasLiveDemo = Boolean(project.demo && project.demo !== "#");
  const kind =
    project.kind || (isMobile ? "Application mobile" : "Application desktop");
  const fit = project.imageFit || (isMobile ? "contain" : "cover");

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-(--card-border) bg-(--card) shadow-lg transition-shadow duration-300 hover:shadow-2xl"
    >
      {/* Image de couverture : captures de téléphone côte à côte, sinon carrousel */}
      {screenshots.length > 0 ? (
        <div
          className={cn(
            "relative",
            project.bgColor || "bg-linear-to-br from-neutral-800 to-neutral-900"
          )}
        >
          {isMobile && screenshots.length > 1 ? (
            <div className="relative aspect-[16/11] w-full">
              <div className="absolute inset-0 flex snap-x items-center gap-4 overflow-x-auto px-6 [scrollbar-width:thin]">
                {screenshots.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-[9/19] h-[88%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/25 bg-black shadow-xl"
                  >
                    <Image
                      src={src}
                      alt={`${project.title} - écran ${i + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ImageCarousel
              images={screenshots}
              alt={project.title}
              aspect="aspect-[16/11]"
              fit={fit}
            />
          )}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-sm font-medium text-(--muted) sm:text-base">{kind}</p>

        <h3 className="mt-2 text-2xl font-bold leading-tight text-(--foreground) sm:text-3xl">
          {project.title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-(--muted) sm:text-base">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--card-border) px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-(--muted) md:text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Boutons, toujours en bas de la carte */}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          {project.video ? (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
            >
              <Play size={14} className="fill-current" />
              Voir la démo
            </button>
          ) : null}

          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-(--card-border) px-4 py-2 text-sm font-semibold text-(--foreground) transition-colors hover:border-violet-500 hover:text-violet-500"
            >
              <Github size={14} />
              Code
            </a>
          ) : null}

          {hasLiveDemo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--card-border) px-4 py-2 text-sm font-semibold text-(--foreground) transition-colors hover:border-violet-500 hover:text-violet-500"
            >
              Voir le site
              <ArrowUpRight size={14} />
            </a>
          ) : null}
        </div>
      </div>

      {showVideo && project.video ? (
        <VideoModal
          url={project.video}
          title={project.title}
          portrait={isMobile}
          onClose={() => setShowVideo(false)}
        />
      ) : null}
    </motion.article>
  );
}