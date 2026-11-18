// Base de connaissances de l'assistant du portfolio.
// Chaque bloc est indépendant : à chaque question, seuls les blocs pertinents sont envoyés au modèle
// (pour rester sous les limites gratuites de Groq). Les "tags" aident à retrouver le bon bloc,
// en français comme en anglais. Modifie librement les textes et ajoute des blocs.
export type KnowledgeChunk = {
  id: string;
  tags: string;
  text: string;
  always?: boolean; // toujours envoyé
};

export const CV_CHUNKS: KnowledgeChunk[] = [
  {
    id: "identite",
    always: true,
    tags: "contact email mail telephone numero phone call linkedin github disponibilite availability available stage internship pfe",
    text: `Betahi Soukayna, étudiante ingénieure en IA à l'ENIAD (cycle ingénieur d'État, 2024 – 2027), basée à Oujda, Maroc.
Contact : email soukaynabetahi12@gmail.com, téléphone professionnel +212 620 290 584, LinkedIn linkedin.com/in/soukayna-betahi-53400135a, GitHub github.com/BetahiSoukayna.
Recherche un stage PFE de 6 mois dès janvier 2027 (ingénierie IA : agents, RAG, assistants conversationnels, traitement documentaire).`,
  },
  {
    id: "profil",
    always: true,
    tags: "profil profile presentation qui parcours about toi specialite points forts",
    text: `Spécialisée en agents autonomes, assistants conversationnels et traitement documentaire (Document AI). Conçoit des solutions IA de bout en bout, avec des résultats mesurables : environ 80 % de gain de temps sur la vérification des dossiers au CRI, réponses en moins de 5 s pour l'assistant de productivité et précision prédictive supérieure à 90 % pour le modèle sur l'hypertension. Maîtrise tout le cycle de développement : backend Python/FastAPI, frontend (React, Flutter, Next.js), bases de données, déploiement. Prête à travailler à distance dans une équipe distribuée.`,
  },
  {
    id: "apercu",
    tags: "parcours experiences experience projets projects resume overview background carriere realisations liste tout",
    text: `Aperçu du parcours. Expérience : stage Ingénieure IA – Document AI au CRI (juillet – septembre 2026), PFA AI Productivity Assistant (mars – mai 2026), stage développeuse logiciel chez Sup MTI Oujda (avril – juin 2024), stage développeuse logiciel à AI-Willaya Oujda-Angad (juillet – août 2023).
Projets : moteur de vérification de complétude des dossiers CRI, AI Productivity Assistant, Système Multi-Agents Clinique (Clinical Orientation MAS), application mobile No9taty, marketplace Flutter offline-first pour l'application étudiante de l'ENIAD, modèle ML de détection de l'hypertension, storyboard interactif de Deep Reinforcement Learning, ce portfolio avec son assistant IA.
Hackathons et engagement : MIATHON'03, hackathon d'un ministère marocain, membre du Club IA et de l'AEI de l'ENIAD, Forum Entreprises ENIAD, événement Rise Her.`,
  },
  {
    id: "cri-stage",
    tags: "cri stage internship projet projects realisations centre regional investissement document ai ocr crui dossiers completude classification pipeline vlm vision manuscrit handwriting regex synonymes procedures investisseurs",
    text: `Stage Ingénieure IA – Document AI, Centre Régional d'Investissement (CRI Oriental), juillet – septembre 2026 (environ 8 semaines, réalisé en binôme, rapport de 29 pages).
Conçu un moteur de vérification de la complétude des dossiers d'investissement, couvrant 30 procédures de la CRUI (Commission Régionale Unifiée d'Investissement) et 40 types de documents canoniques (avec synonymes, mots-clés forts et faibles, regex).
Pipeline end-to-end en Python : extraction de texte PDF, OCR avec fallback pour le manuscrit, classification de documents par règles (mots-clés, synonymes, regex), moteur de règles de complétude, génération du rapport. Ajout d'un Vision-Language Model (via OpenRouter, avec timeouts allongés et retries exponentiels) en dernier recours pour les documents que les règles ne savent pas classer.
Résultats : environ 80 % de gain de temps sur la vérification des dossiers et une précision de classification d'environ 92 %.
Stack : Python, Tesseract, EasyOCR, regex, VLM, FastAPI.`,
  },
  {
    id: "cri-validation",
    tags: "validation conformite projet projects realisations compatibilite coordonnees haversine titre foncier superficie signature proprietaire rc ice if certificat score regles cohérence coherence donnees",
    text: `Module de validation de compatibilité et de conformité des données ajouté au moteur CRI : 6 validations et plus de 15 règles. Il vérifie que les certificats de propriété ont moins de 3 mois, la cohérence des propriétaires (noms, RC, ICE, IF), les numéros de titre foncier, les superficies (tolérance ±10 %), les coordonnées géographiques (formats DMS et décimal, distance de Haversine) et la présence des signatures sur les documents officiels. Produit un score global de 0 à 100, des anomalies détaillées avec suggestions et des recommandations automatiques. Pipeline en 3 étapes : complétude, cohérence, compatibilité. Seuils configurables.`,
  },
  {
    id: "cri-design",
    tags: "design maquette prototype ux ui back-office agents cri interface ecrans arabe rtl accessibilite",
    text: `Conception d'une maquette haute-fidélité du module de vérification de complétude, pour les agents back-office du CRI : parcours en 5 écrans (choix de la procédure, dépôt des fichiers, progression en 3 étapes, résultat dossier incomplet ou complet), composant « ligne de document requis » à 5 états (confirmé, manquant bloquant, optionnel, ambigu, non reconnu), interface lisible d'un coup d'œil, prête pour l'arabe (RTL), sans information transmise par la couleur seule.`,
  },
  {
    id: "pfa-assistant",
    tags: "pfa productivity assistant projet projects realisations google workspace gmail drive calendar tasks rag langgraph chromadb groq llama fastapi react vite eniad groupe",
    text: `AI Productivity Assistant – Projet de fin d'année (PFA), ENIAD, mars – mai 2026, projet de groupe. Assistant IA qui automatise les workflows Google Workspace (Gmail, Drive, Calendar, Tasks). Ma part : le pipeline RAG (recherche sémantique sur ChromaDB, migré de Chroma Cloud vers une base locale) et l'orchestration LangGraph, avec un temps de réponse inférieur à 5 s pour la recherche de documents complexes. Rédaction du chapitre 3 du rapport et préparation de la soutenance.
Stack : Python, LangGraph, RAG, ChromaDB, Groq (Llama 3.1), FastAPI, React/Vite.`,
  },
  {
    id: "clinical-mas",
    tags: "clinical orientation mas projet projects realisations multi agents multi-agents clinique medical diagnostic human in the loop medecin mcp langgraph streamlit fastapi langchain",
    text: `Système Multi-Agents Clinique (Clinical Orientation MAS) : système d'orientation clinique basé sur LangGraph. Workflow supervisé avec un agent diagnostique (5 questions au patient), une synthèse clinique préliminaire, une validation Human-in-the-Loop par un médecin (asynchrone) et la génération d'un rapport final structuré. Architecture modulaire orchestrant 6 outils MCP, exposée via FastAPI avec une interface Streamlit.
Stack : Python, LangGraph, LangChain, FastAPI, Streamlit, MCP, PostgreSQL.`,
  },
  {
    id: "no9taty",
    tags: "no9taty mobile projet projects realisations flutter dart supabase sqlite offline-first notes moyennes application academique",
    text: `No9taty : application mobile de gestion académique (portefeuille de notes) avec architecture offline-first et synchronisation, tableau de bord étudiant, authentification, gestion des notes et calcul automatique des moyennes. Pas de perte de données hors ligne. Stack : Flutter, Dart, Supabase, SQLite, gestion d'état.`,
  },
  {
    id: "marketplace",
    tags: "marketplace flutter projet projects realisations eniad application etudiante supabase cache images synchronisation mobile",
    text: `Fonctionnalité marketplace offline-first pour une application mobile étudiante de l'ENIAD (Flutter) : intégration Supabase, cache local des images, support de plusieurs images par annonce et synchronisation en arrière-plan.`,
  },
  {
    id: "hypertension",
    tags: "hypertension ml projet projects realisations machine learning sante prediction modele scikit-learn pandas numpy dut projet fin etudes streamlit",
    text: `Modèle prédictif de détection de l'hypertension – projet de fin d'études du DUT (février – avril 2024) : pipeline d'analyse de données de santé multivariées (prétraitement, feature engineering, sélection de modèles), précision de validation supérieure à 90 %, modèle léger exporté et prêt pour une intégration via API. Stack : Python, Scikit-learn, Pandas, NumPy, Streamlit.`,
  },
  {
    id: "stages-dev",
    tags: "sup mti willaya stage developpeuse logiciel web php javascript plateforme projets academiques rendez-vous calendrier internship software developer",
    text: `Stage développeuse logiciel, Sup MTI Oujda (avril – juin 2024) : conception et développement d'une plateforme web de gestion et de suivi des projets académiques (PHP/JavaScript), structuration du code, débogage, validation fonctionnelle, tests utilisateurs et ajustement de l'ergonomie (UI/UX).
Stage Software Developer, AI-Willaya d'Oujda-Angad (juillet – août 2023) : conception d'une plateforme de gestion et d'optimisation des calendriers de rendez-vous en ligne, maintenance corrective, troubleshooting et optimisation des requêtes de base de données.`,
  },
  {
    id: "hackathon-ministere",
    tags: "hackathon ministere etat civil registre civil digitalisation nextjs supabase claude api",
    text: `Hackathon organisé par un ministère marocain : projet de digitalisation de l'état civil (« إدارتي ») développé en Next.js avec Supabase et l'API Claude.`,
  },
  {
    id: "strategeo",
    tags: "miathon strategeo strategio hackathon geopolitique veille strategique investissements ump campus du savoir nlp",
    text: `Hackathon MIATHON'03 (mars 2026, Campus du Savoir, UMP Oujda, 72 h) : développeuse IA/ML sur Strategeo, un outil d'intelligence géopolitique et de veille stratégique pour guider et sécuriser les investissements des entreprises (Python, NLP).`,
  },
  {
    id: "cours",
    tags: "cours formation enseignement jade fipa agents pytorch cnn mobilenet dyna-q reinforcement learning deep learning drl dqn ppo power bi talend etl business intelligence big data devops mlops cloud virtualisation storyboard",
    text: `Travaux de cours et projets pédagogiques : systèmes multi-agents avec JADE (messagerie FIPA-ACL, enregistrement DF, comportements d'agents) et LangGraph ; deep learning avec PyTorch (classification binaire CNN, MobileNetV2 depuis zéro, dataset PlantVillage) ; Dyna-Q en apprentissage par renforcement ; storyboard interactif de Deep Reinforcement Learning (DQN, Policy Gradient, Actor-Critic/PPO) avec audio ; Business Intelligence/ETL avec Talend et Power BI. Cours suivis à l'automne 2026 : big data, DevOps, MLOps, virtualisation, cloud computing.`,
  },
  {
    id: "competences",
    tags: "competences skills technologies technos technology tech stack outils tools langages programmation maitrise python docker sql techniques frameworks bibliotheques",
    text: `Compétences techniques.
Document AI : OCR (Tesseract, benchmarking EasyOCR), extraction de texte PDF, classification de documents, regex, Vision-Language Models.
LLM et IA générative : RAG, LangGraph, LangChain, ChromaDB, embeddings, recherche sémantique (BM25), prompt engineering, outils MCP, APIs LLM (OpenAI, Gemini, Claude, Groq, OpenRouter).
Machine Learning et NLP : Scikit-learn, Keras, TensorFlow, PyTorch, spaCy, NLTK, feature engineering, évaluation de modèles.
Programmation et données : Python (avancé), SQL, Pandas, NumPy, PostgreSQL, MySQL, SQLite, Supabase, ChromaDB, PHP.
Backend et outils : FastAPI, API REST, Git, GitHub, GitHub Actions, Docker, Linux, Scrum, Kanban.
Frontend et mobile : Flutter, Dart, React, Next.js, HTML5, CSS3, JavaScript, Streamlit.
Sécurité de l'IA : détection d'injection de prompt, sûreté des LLM, sensibilisation au RGPD.`,
  },
  {
    id: "formation",
    tags: "formation education etudes etudie study studied school university degree diploma engineering eniad est dut bac baccalaureat cycle ingenieur annees",
    text: `Formation : cycle Ingénieur d'État en Intelligence Artificielle, ENIAD (École Nationale de l'IA et du Digital, Université Mohammed Premier), 2024 – 2027 ; DUT en Informatique de Gestion, EST Oujda, 2022 – 2024 ; Baccalauréat Sciences Physiques, Er-Rich, 2021 – 2022.`,
  },
  {
    id: "engagement",
    tags: "engagement club vie associative ia nurl aei forum entreprises eniad organisatrice rise her femme technologie benevole leadership communication",
    text: `Engagement à l'ENIAD : membre active du Club IA (Nurl AI Club) et de l'AEI. Membre de l'équipe Communication de la 1re édition du Forum Entreprises ENIAD (octobre 2025) et co-organisatrice de la 2e édition (programme sur trois jours). Organisatrice de l'événement Rise Her / « Femme & Technologie » (avril 2026) : programmation, contact des intervenantes, communication sur les réseaux sociaux. Ambassadrice de l'ENIAD lors de journées d'orientation.`,
  },
  {
    id: "langues",
    tags: "langues languages speak spoken francais french anglais english arabe arabic darija interets interests hobbies methodes agile scrum veille open source ia generative",
    text: `Langues : français (C1), anglais (B2+), arabe (langue maternelle, avec la darija). Méthodes : Agile / Scrum, leadership technique, veille technologique. Centres d'intérêt : applications web et mobiles intelligentes, UX/UI adaptative pour l'IA, veille sur l'IA générative, hackathons, projets open source.`,
  },
  {
    id: "portfolio-site",
    tags: "portfolio site web projet projects realisations chatbot assistant ia rag nextjs tailwind groq ce site cree",
    text: `Ce portfolio : site Next.js / TypeScript / Tailwind avec un assistant IA qui répond aux visiteurs à partir du CV et des données du portfolio (Next.js, Groq). Il s'appuie sur un projet RAG antérieur (FastAPI, LangGraph, ChromaDB).`,
  },
];