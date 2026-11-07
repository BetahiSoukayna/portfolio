"use client";

import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";

export function Projects() {
  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl px-4 pb-28 pt-0"
      style={{ scrollMarginTop: "120px" }}
    >
      <div className="mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-(--accent) sm:text-base">
          Projets
        </span>
        <h2 className="mt-2 text-3xl font-bold sm:text-5xl md:text-6xl">
          Mes réalisations <span className="text-gradient-shimmer">récentes</span>
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
