"use client";

import { motion } from "framer-motion";
import {
  SiDocker,
  SiGit,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiPython,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiFastapi,
  SiFlutter,
  SiPostgresql,
  SiLangchain,
  SiLanggraph,
} from "react-icons/si";

export function Skills() {
  const beltChunk = [...Array(4)].flatMap(() => [
    { name: "Python", icon: SiPython, color: "#3776AB" },
    { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00" },
    { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C" },
    { name: "Scikit-learn", icon: SiScikitlearn, color: "#F7931E" },
    { name: "Pandas", icon: SiPandas, color: "#150458" },
    { name: "Langchain", icon: SiLangchain, color: "#150458" },
    { name: "LangGraph", icon: SiLanggraph, color: "#150458" },
    { name: "FastAPI", icon: SiFastapi, color: "#009688" },
    { name: "Flutter", icon: SiFlutter, color: "#02569B" },
    { name: "React", icon: SiReact, color: "#61DAFB" },
    { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
    { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    { name: "Git", icon: SiGit, color: "#F05032" },
    { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
  ]);

  const skillGroups = [
    {
      title: "Data Science & IA",
      summary: "Data preprocessing, Feature Engineering, Visualisation, Modélisation ML/DL",
      items: [
        "Python (Pandas, NumPy, Scikit-learn)",
        "TensorFlow / PyTorch",
        "Classification, régression, clustering",
        "LLM, RAG, fine-tuning",
        "Power BI, Talend"
      ],
    },
    {
      title: "Développement & Architecture",
      summary: "APIs robustes et applications performantes",
      items: [
        "FastAPI / REST APIs",
        "Flutter / React",
        "PostgreSQL / SQLite / Supabase",
        "Architecture offline-first",
      ],
    },
    {
      title: "Infrastructure & Déploiement",
      summary: "Du développement à la mise en production",
      items: [
        "Git & GitHub workflows",
        "Monitoring & optimisation",
        "Design Thinking / Agile"
      ],
    },
  ];

  return (
    <section
      id="skills"
      className="relative overflow-hidden pt-0 pb-28"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="section">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-(--accent) sm:text-base">
            Expertise technique
          </span>
          <h2 className="mt-2 px-2 text-3xl font-bold tracking-tight text-pretty sm:text-5xl md:text-6xl">
            Compétences{" "}
            <span className="text-gradient-shimmer">Overview</span>
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          {skillGroups.map((group, idx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-(--card-border) bg-linear-to-br from-(--card) to-(--card-border) p-5 hover:border-violet-400/40 transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-base font-semibold">{group.title}</h3>
              <p className="mt-1 text-xs text-(--muted)">{group.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-(--muted)">
                {group.items.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl border border-(--card-border) bg-(--card)/40 py-3"
        >
          <div className="relative overflow-hidden">
            <motion.div
              className="flex w-max items-center gap-8 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 30,
              }}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-8 px-4">
                  {beltChunk.map((item, index) => (
                    <div key={`${copy}-${item.name}-${index}`} className="flex items-center gap-2">
                      <item.icon style={{ color: item.color }} size={16} />
                      <span className="text-xs uppercase tracking-wider text-(--muted)">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}