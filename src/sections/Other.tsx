"use client";

import { motion } from "framer-motion";
import { Mail, FileText, Award, BookOpen, Linkedin, Github } from "lucide-react";

export function Other() {
  const items = [
    {
      key: "certifications",
      icon: Award,
      title: "Activités & Certifications",
      desc: "Veille IA, Hackathons, Engagement associatif, Clubs tech",
      href: "/activites",
      color: "from-violet-500 to-purple-500",
    },
    {
      key: "cv",
      icon: FileText,
      title: "Télécharger CV",
      desc: "Consultez mon CV complet pour plus de détails sur mon parcours",
      href: "/cv.pdf",
      color: "from-amber-500 to-orange-500",
    },
    {
      key: "contact",
      icon: Mail,
      title: "Me contacter",
      desc: "soukaynabetahi12@gmail.com | Disponible pour un stage PFE",
      href: "mailto:soukaynabetahi12@gmail.com",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden pt-0 pb-24 sm:pb-32"
      style={{ scrollMarginTop: "120px" }}
    >
      <div className="section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="mb-4 px-2 text-3xl font-bold text-pretty sm:text-5xl md:text-6xl">
            Contact &{" "}
            <span className="text-gradient-shimmer">Ressources</span>
          </h2>
          <p className="mx-auto max-w-2xl px-3 text-base text-(--muted) sm:text-lg md:text-xl">
            N&apos;hésitez pas à me contacter pour toute opportunité ou collaboration
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, idx) => (
            <motion.a
              key={item.key}
              href={item.href}
              target={item.key === "cv" ? "_blank" : undefined}
              rel={item.key === "cv" ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group glass relative cursor-pointer overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-105 sm:p-8"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />
              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <div
                  className={`h-16 w-16 rounded-2xl bg-linear-to-br ${item.color} p-0.5`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-(--background)">
                    <item.icon size={32} style={{ color: "var(--foreground)" }} />
                  </div>
                </div>
                <div>
                  <h3
                    className={`bg-linear-to-br ${item.color} mb-2 bg-clip-text px-1 text-xl font-bold text-transparent sm:text-2xl`}
                  >
                    {item.title}
                  </h3>
                  <p className="px-1 text-xs text-(--muted) sm:text-sm">{item.desc}</p>
                </div>
                <div
                  className={`bg-linear-to-br ${item.color} mt-2 bg-clip-text text-sm font-semibold text-transparent transition-transform duration-300 group-hover:translate-x-2`}
                >
                  {item.key === "cv" ? "Télécharger →" : item.key === "contact" ? "Envoyer un email →" : "En savoir plus →"}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Social Links Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex gap-6 rounded-full border border-(--card-border) bg-(--card)/40 px-6 py-3 backdrop-blur-sm">
            <a
              href="https://www.linkedin.com/in/soukayna-betahi-53400135a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--muted) transition-all hover:text-violet-400 hover:scale-110"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://github.com/BetahiSoukayna"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--muted) transition-all hover:text-violet-400 hover:scale-110"
            >
              <Github size={20} />
            </a>
            <a
              href="mailto:soukaynabetahi12@gmail.com"
              className="text-(--muted) transition-all hover:text-violet-400 hover:scale-110"
            >
              <Mail size={20} />
            </a>
          </div>
          <p className="mt-6 text-xs text-(--muted)">
            © 2026 Soukayna Betahi - Tous droits réservés
          </p>
        </motion.div>
      </div>
    </section>
  );
}
