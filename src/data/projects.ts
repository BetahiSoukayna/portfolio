export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  deviceType: "desktop" | "mobile";
  bgColor?: string;
  screenshots?: string[];
}

export const projects: Project[] = [
  {
    id: "ai-assistant-rag",
    title: "AI Productivity Assistant",
    description: "Assistant IA avec RAG et LangGraph pour la recherche et l'automatisation sur Gmail et Drive / Calandrier et Task. Recherche des documents complexe en moins de 5 secondes.",
    tags: ["Python", "RAG", "LangGraph", "FastAPI", "ChromaDB"],
    github: "https://github.com/OUALIDENIAD20/project-pfa-ia-productivity-google-workspace.git",
    demo: "#",
    featured: true,
    deviceType: "desktop",
    bgColor: "bg-linear-to-br from-violet-500/90 to-fuchsia-500/90",
    screenshots: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  {
    id: "no9taty",
    title: "No9taty",
    description: "Application mobile de gestion académique avec synchronisation offline-first. Tableau de bord étudiant, authentification, gestion de notes et calcul automatique de moyennes.",
    tags: ["Flutter", "Dart", "Supabase", "SQLite"],
    github: "https://github.com/BetahiSoukayna/No9taty.git",
    demo: "#",
    featured: true,
    deviceType: "mobile",
    bgColor: "bg-linear-to-br from-blue-500/90 to-cyan-500/90",
    screenshots: [
    "/images/noktaty.jpeg"
  ],
  },
  {
    id: "hypertension-ml",
    title: "Modèle Hypertension ML",
    description: "Conception et entraînement d'un modèle ML pour la détection précoce de l'hypertension artérielle. Précision clinique > 90%.",
    tags: ["Python", "Scikit-learn", "Pandas", "NumPy", "Streamlit"],
    github: "https://github.com/BetahiSoukayna/hypertension-ml",
    demo: "#",
    featured: true,
    deviceType: "desktop",
    bgColor: "bg-linear-to-br from-emerald-500/90 to-teal-500/90",
    screenshots: [
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1400&auto=format&fit=crop",
    ],
  },

//   {
//   id: "clinical-orientation-mas",
//   title: "Clinical Orientation MAS",
//   description: "Système multi-agents d'orientation clinique basé sur LangGraph. Workflow supervisé avec agent diagnostique (5 questions patient), synthèse clinique préliminaire, validation Human-in-the-Loop médecin, et génération de rapport final structuré. Exposé via FastAPI avec interface Streamlit et intégration MCP.",
//   tags: ["LangGraph", "LangChain", "FastAPI", "Streamlit", "MCP", "Python"],
//   github: "https://github.com/BetahiSoukayna/clinical-orientation-mas",
//   demo: "#",
//   featured: true,
//   deviceType: "desktop",
//   bgColor: "bg-linear-to-br from-emerald-500/90 to-teal-600/90",
//   screenshots: [
//     "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=900&auto=format&fit=crop",
//     "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=900&auto=format&fit=crop",
//   ],
// },
];