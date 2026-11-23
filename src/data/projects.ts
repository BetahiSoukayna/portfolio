export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;   // lien d'un site en ligne (optionnel)
  video?: string;  // lien de la vidéo de démo (YouTube, Vimeo, Drive ou /videos/xxx.mp4)
  kind?: string;   // étiquette au-dessus du titre (défaut : "Application desktop" ou "Application mobile")
  imageFit?: "cover" | "contain"; // "contain" = capture entière, sans recadrage
  featured?: boolean;
  deviceType: "desktop" | "mobile";
  bgColor?: string;
  screenshots?: string[];
}

export const projects: Project[] = [
  {
    id: "cri-document-ai",
    title: "Vérification des dossiers d'investissement (CRI)",
    kind: "Document AI · Back-office",
    description:
      "Moteur de vérification de la complétude des dossiers d'investissement : 30 procédures CRUI et 40 types de documents. OCR avec fallback pour le manuscrit, classification par règles et Vision-Language Model en dernier recours. Environ 80 % de gain de temps.",
    tags: ["Python", "OCR", "Document AI", "VLM", "Regex"],
    featured: true,
    deviceType: "desktop",
    imageFit: "contain",
    bgColor: "bg-linear-to-br from-sky-500/90 to-indigo-500/90",
    screenshots: [
      "/images/cri1.png",
      "/images/cri2.png",
      "/images/cri3.png",
    ],
  },
  {
    id: "ai-assistant-rag",
    title: "AI Productivity Assistant",
    kind: "Assistant IA · Google Workspace",
    description:
      "Assistant IA avec RAG et LangGraph pour la recherche et l'automatisation sur Gmail, Drive, Calendrier et Tasks. Recherche de documents complexes en moins de 5 secondes.",
    tags: ["Python", "RAG", "LangGraph", "FastAPI", "ChromaDB"],
    github: "https://github.com/OUALIDENIAD20/project-pfa-ia-productivity-google-workspace.git",
    // video: "https://www.youtube.com/watch?v=...",  // à décommenter avec ton vrai lien YouTube
    featured: true,
    deviceType: "desktop",
    imageFit: "contain",
    bgColor: "bg-linear-to-br from-violet-500/90 to-fuchsia-500/90",
    screenshots: [
      "/images/ai_productivity.png",
      "/images/assistant1.png",
      "/images/assisstant2.png",
      "/images/assisstant3.png",
      "/images/assisstant4.png",
      "/images/assisstant5.png",
    ],
  },

{
  id: "clinical-multi-agent",
  title: "ClinicaFlow – Multi-Agent Clinical Assistant",
  kind: "AI Agents · Santé · Human-in-the-Loop",
  description:
    "Plateforme d'orientation clinique simulée basée sur une architecture multi-agents avec LangGraph. Un Diagnostic Agent collecte les informations du patient à travers 5 questions successives, produit une synthèse clinique préliminaire et une recommandation intermédiaire. Un médecin intervient dans le workflow via un mécanisme Human-in-the-Loop avant que le Report Agent génère un rapport final structuré.",
  tags: [
    "Python",
    "LangGraph",
    "LangChain",
    "AI Agents",
    "FastAPI",
    "MCP",
    "Streamlit"
  ],
  featured: true,
  deviceType: "desktop",
  imageFit: "contain",
  bgColor: "bg-linear-to-br from-cyan-500/90 to-blue-600/90",
  screenshots: [
    "/images/ClinicaFlow.png",
  ],
},
  {
    id: "no9taty",
    title: "No9taty",
    description:
      "Application mobile de gestion académique avec synchronisation offline-first. Tableau de bord étudiant, authentification, gestion de notes et calcul automatique de moyennes.",
    tags: ["Flutter", "Dart", "Supabase", "SQLite"],
    github: "https://github.com/BetahiSoukayna/No9taty.git",
    featured: true,
    deviceType: "mobile",
    bgColor: "bg-linear-to-br from-blue-500/90 to-cyan-500/90",
    screenshots: [
      "/images/noktaty1.jpeg",
      "/images/noktaty2.jpeg",
      "/images/noktaty3.jpeg",
      "/images/noktaty4.jpeg",
      "/images/noktaty5.jpeg",
      "/images/noktaty6.jpeg",
      "/images/noktaty7.jpeg",
      "/images/noktaty8.jpeg",
      "/images/noktaty9.jpeg",
    ],
  },
  {
    id: "hypertension-ml",
    title: "Modèle Hypertension ML",
    kind: "Machine learning · Santé",
    description:
      "Conception et entraînement d'un modèle ML pour la détection précoce de l'hypertension artérielle. Précision de validation supérieure à 90 %.",
    tags: ["Python", "Scikit-learn", "Pandas", "NumPy", "Streamlit"],
    github: "https://github.com/BetahiSoukayna/hypertension-ml",
    featured: true,
    deviceType: "desktop",
    bgColor: "bg-linear-to-br from-emerald-500/90 to-teal-500/90",
    // screenshots: ["/images/hypertension1.png"],  // ajoute une capture de ton app Streamlit
  },
];