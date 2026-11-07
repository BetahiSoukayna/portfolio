"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GraduationCap, Briefcase, Calendar, MapPin } from "lucide-react";

export function About() {
  const formations = [
    {
      title: "Cycle d'ingénieur – Intelligence Artificielle",
      school: "ENIAD – École Nationale de l&apos;IA et du Digital",
      location: "Berkane",
      period: "2024 – Présent",
      description: "3ᵉ année du cycle ingénieur",
    },
    {
      title: "Diplôme Universitaire de Technologie (DUT) – Informatique de gestion",
      school: "EST – École Supérieure de Technologie",
      location: "Oujda",
      period: "2022 – 2024",
      description: "Cycle DUT – Spécialisation Informatique de gestion",
    },
    {
      title: "Baccalauréat en Sciences Physiques",
      school: "Lycée Moulay Ali-Chérif",
      location: "ER-Rich",
      period: "2021 – 2022",
      description: "Baccalauréat Sciences Physiques – Mention Bien",
    },
  ];

  const experiences = [
    {
      title: "Développeuse Logiciel",
      company: "Sup Mti Oujda",
      location: "Oujda, Maroc",
      period: "Avril – Juin 2024",
      description: "Développement d'une plateforme web complète pour la gestion intégrée des projets PFA, PFE et stages.",
      technologies: ["HTML", "CSS", "PHP", "JavaScript"],
    },
    {
      title: "Software Developer Intern",
      company: "AI-Willaya, Oujda-Angad",
      location: "Oujda, Maroc",
      period: "Juillet – Août 2023",
      description: "Conception et développement d'une plateforme de gestion des rendez-vous en ligne.",
      technologies: ["HTML", "CSS", "PHP", "JavaScript"],
    },
  ];

  const softSkills = [
    "Communication", "Leadership", "Gestion du temps", 
    "Organisation", "Public Speaking", "Résolution des problèmes"
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden pb-28 pt-0"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="section">
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-(--accent) sm:text-base">
            Qui suis-je ?
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-5xl md:text-6xl">
            À propos de <span className="text-gradient-shimmer">moi</span>
          </h2>
        </div>

        <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative flex-shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-75 blur-xl animate-pulse" />
            
            <div className="absolute -inset-3 rounded-full bg-violet-500/30 blur-2xl" />
            
            <div className="relative h-48 w-48 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 p-1 shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-(--card)">
                <Image
                  src="/images/Ophoto.jpg"
                  alt="Soukayna Betahi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 256px"
                  priority
                />
              </div>
            </div>

            {/* Petite décoration */}
            <div className="absolute -bottom-2 -right-2 rounded-full bg-violet-500 p-2 shadow-lg">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
          </motion.div>

          {/* Texte - côté droit */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1 space-y-4 text-center lg:text-left"
          >
            <h3 className="text-2xl font-bold text-(--foreground) sm:text-3xl">
              Soukayna Betahi
            </h3>
            <p className="text-sm text-(--accent) uppercase tracking-wider">
              Étudiante Ingénieur en Intelligence Artificielle
            </p>
            <div className="h-1 w-20 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 lg:mx-0 mx-auto" />
            <p className="text-base leading-relaxed text-(--muted)">
              Étudiante ingénieur en IA à l&apos;ENIAD, avec une solide base en informatique. 
              Orientée vers l&apos;AI Engineering, avec des compétences en data science, machine learning 
              et deep learning, appliquées au traitement du texte et à la vision par ordinateur.
            </p>
            <p className="text-base leading-relaxed text-(--muted)">
              J&apos;aime transformer une idée en un projet concret, fonctionnel et esthétique. 
              Mon objectif est de construire une carrière dans l&apos;IA et le développement, 
              et participer à des projets qui ont un impact réel.
            </p>

            {/* Soft Skills Tags */}
            <div className="pt-4">
              <h4 className="mb-3 text-sm font-semibold text-(--foreground)">Soft Skills</h4>
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {softSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 backdrop-blur-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Formation & Stages */}
        <div className="mx-auto max-w-6xl">
          {/* Formation Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-violet-500/20 p-2">
                <GraduationCap className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-(--foreground)">Formation</h3>
              <div className="h-px flex-1 bg-linear-to-r from-violet-500/30 to-transparent" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation, index) => (
                <motion.div
                  key={formation.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group rounded-xl border border-(--card-border) bg-linear-to-br from-(--card) to-(--card-border) p-5 transition-all duration-300 hover:border-violet-400/40 hover:-translate-y-1"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-(--foreground)">{formation.title}</h4>
                      <p className="mt-1 text-sm text-violet-400">{formation.school}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-(--muted)">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {formation.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formation.period}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-(--muted)">{formation.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stages / Expériences Professionnelles Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-fuchsia-500/20 p-2">
                <Briefcase className="h-5 w-5 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-(--foreground)">Stages & Expériences</h3>
              <div className="h-px flex-1 bg-linear-to-r from-fuchsia-500/30 to-transparent" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="group rounded-xl border border-(--card-border) bg-linear-to-br from-(--card) to-(--card-border) p-5 transition-all duration-300 hover:border-fuchsia-400/40 hover:-translate-y-1"
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-(--foreground)">{exp.title}</h4>
                      <p className="text-sm text-fuchsia-400">{exp.company}</p>
                    </div>
                    <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-300">
                      {exp.period}
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-xs text-(--muted)">
                    <MapPin size={12} />
                    <span>{exp.location}</span>
                  </div>
                  <p className="text-sm text-(--muted)">{exp.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-(--muted)"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}