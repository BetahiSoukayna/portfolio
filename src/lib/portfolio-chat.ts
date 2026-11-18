import portfolio from "rag_systeme/data/data_portfolio.json";
import { CV_CHUNKS, type KnowledgeChunk } from "@/data/cv-text";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const OWNER_NAME = process.env.PORTFOLIO_OWNER_NAME || "Soukayna Betahi";

const MAX_HISTORY_TURNS = 4;
const MAX_CHUNKS = 7;
const MAX_CONTEXT_CHARS = 6000;

// ───────────────────────── Normalisation ─────────────────────────
function norm(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019`]/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ───────────────────────── Small talk (sans appel LLM) ─────────────────────────
const SMALL_TALK = new Set(
  [
    "bonjour", "salut", "hello", "hi", "hey", "salam", "bonsoir",
    "merci", "thanks", "thank you",
    "ça va", "ca va", "cava", "ça va ?", "ca va ?",
    "?", "??", "???", "...",
  ].map(norm)
);
const THANKS = new Set(["merci", "thanks", "thank you"].map(norm));
const ENGLISH_GREETINGS = new Set(["hello", "hi", "hey", "thanks", "thank you"].map(norm));

const SMALL_TALK_ANSWERS = {
  greeting_fr:
    "Bonjour 👋 Posez-moi vos questions sur mon profil. Par exemple :\n\n" +
    "- Mon parcours et ma formation\n" +
    "- Mes projets en IA\n" +
    "- Mes compétences techniques\n" +
    "- Mes expériences et hackathons",
  greeting_en:
    "Hello 👋 Ask me anything about my background. For example:\n\n" +
    "- My education and career path\n" +
    "- My AI projects\n" +
    "- My technical skills\n" +
    "- My experience and hackathons",
  thanks_fr:
    "Avec plaisir ! N'hésitez pas si vous avez d'autres questions sur mon profil.",
  thanks_en:
    "You're welcome! Feel free to ask if you have more questions about my background.",
} as const;

export function smallTalkAnswer(question: string): string | null {
  const q = norm(question);
  if (!SMALL_TALK.has(q)) return null;
  const lang = ENGLISH_GREETINGS.has(q) ? "en" : "fr";
  const kind = THANKS.has(q) ? "thanks" : "greeting";
  return SMALL_TALK_ANSWERS[`${kind}_${lang}` as keyof typeof SMALL_TALK_ANSWERS];
}

// ───────────────────────── Langue de la réponse ─────────────────────────
const FRENCH_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "est", "sont", "es",
  "tu", "ton", "ta", "tes", "vous", "votre", "vos", "avez", "as", "ai",
  "qui", "que", "quoi", "quel", "quelle", "quels", "quelles", "quand", "ou",
  "comment", "pourquoi", "combien", "avec", "pour", "dans", "sur", "chez",
  "parle", "presente", "peux", "peut", "projet", "projets", "competences",
  "experience", "experiences", "formation", "etudes", "parcours", "sais",
  "fais", "faites", "travaille", "stage", "j", "t", "qu",
]);
const ENGLISH_WORDS = new Set([
  "the", "and", "is", "are", "you", "your", "do", "does", "did", "have", "has",
  "what", "which", "who", "whom", "where", "when", "why", "how", "with", "for",
  "about", "tell", "can", "could", "would", "any", "her", "she", "his", "he",
  "projects", "project", "skills", "experience", "experiences", "studies",
  "work", "worked", "working", "background", "education", "of", "to", "in",
  "hello", "thanks", "thank",
]);

export function detectLanguage(question: string, fallback = "French"): string {
  if (/[\u0600-\u06FF]/.test(question)) return "Arabic";
  const tokens = norm(question).match(/[a-z]+/g) || [];
  const fr = tokens.filter((t) => FRENCH_WORDS.has(t)).length;
  const en = tokens.filter((t) => ENGLISH_WORDS.has(t)).length;
  if (en > fr) return "English";
  if (fr > en) return "French";
  return fallback;
}

// ───────────────────────── Nettoyage Markdown ─────────────────────────
const THINK = /<think>[\s\S]*?<\/think>/gi;
const LIST_ITEM = /^\s*([-*•]|\d+[.)])\s+/;
const HEADING = /^\s*#{1,6}\s+/;

export function cleanAnswer(raw: string): string {
  if (!raw) return "";
  let text = raw.replace(THINK, "").replace(/\r\n/g, "\n").trim();
  text = text.replace(/^(\s*)[•*]\s+/gm, "$1- ");
  text = text.replace(/^#{1,2}\s+/gm, "### ");

  const out: string[] = [];
  for (const line of text.split("\n")) {
    const isList = LIST_ITEM.test(line);
    const isHeading = HEADING.test(line);
    const prev = out.length ? out[out.length - 1] : "";

    if (out.length && prev.trim()) {
      const prevIsList = LIST_ITEM.test(prev);
      const prevIsHeading = HEADING.test(prev);
      if (isHeading && !prevIsHeading) out.push("");
      else if (isList && !prevIsList) out.push("");
      else if (prevIsHeading && line.trim()) out.push("");
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ───────────────────────── Prompt ─────────────────────────
function formatHistory(history: ChatMessage[], question: string): string {
  let msgs = (history || []).filter((m) => m && typeof m.content === "string" && m.content);
  const last = msgs[msgs.length - 1];
  if (last && last.role === "user" && last.content.trim() === question.trim()) {
    msgs = msgs.slice(0, -1);
  }
  msgs = msgs.slice(-MAX_HISTORY_TURNS);
  if (!msgs.length) return "(aucun)";
  return msgs
    .map((m) => `${m.role === "user" ? "Visiteur" : "Assistant"} : ${m.content.slice(0, 400)}`)
    .join("\n");
}

// ───────────────────────── Base de connaissances + sélection par question ─────────────────────────
interface PortfolioJson {
  experiences?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
}

const TYPE_TAGS: Record<string, string> = {
  hackathon: "hackathon competition concours",
  formation: "formation cours certification training",
  club_event: "club evenement event association organisatrice engagement activites",
  orientation: "orientation ambassadrice forum etudiant stand activites",
};

function str(v: unknown): string {
  return Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : "";
}

function jsonChunks(): KnowledgeChunk[] {
  const data = portfolio as unknown as PortfolioJson;
  const chunks: KnowledgeChunk[] = [];

  (data.experiences || []).forEach((e, i) => {
    const parts = [
      `${str(e.name)} (${str(e.type)})`,
      e.organizer ? `organisateur : ${str(e.organizer)}` : "",
      e.role ? `rôle : ${str(e.role)}` : "",
      e.date ? `date : ${str(e.date)}` : "",
      e.duration ? `durée : ${str(e.duration)}` : "",
      e.location ? `lieu : ${str(e.location)}` : "",
      e.description ? str(e.description) : "",
      e.result ? `Résultat : ${str(e.result)}` : "",
      e.technologies ? `Technologies : ${str(e.technologies)}` : "",
    ].filter(Boolean);
    chunks.push({
      id: `json-exp-${i}`,
      tags: [str(e.name), str(e.organizer), str(e.role), str(e.technologies), TYPE_TAGS[str(e.type)] || "", "experience activites"].join(" "),
      text: parts.join(" ; ") + ".",
    });
  });

  (data.projects || []).forEach((p, i) => {
    chunks.push({
      id: `json-proj-${i}`,
      tags: [str(p.name), str(p.technologies), "projet projects"].join(" "),
      text: `Projet : ${str(p.name)}. ${str(p.description)} Technologies : ${str(p.technologies)}.`,
    });
  });

  return chunks;
}

const STOPWORDS = new Set([
  "les", "des", "une", "que", "qui", "est", "sont", "pour", "dans", "avec", "sur", "chez", "tu", "ton", "tes",
  "vous", "votre", "vos", "quel", "quels", "quelle", "quelles", "comment", "quoi", "parle", "moi", "peux",
  "the", "and", "you", "your", "what", "are", "how", "about", "tell", "can", "does", "did", "have", "has",
  "which", "who", "with", "for", "her", "she", "his", "him", "any", "all", "not", "was", "were",
  "parles", "connais", "sais", "fais", "fait", "faire", "as", "ete", "etes", "aussi", "fonctionne",
  "did", "does", "where", "when", "why", "much", "many", "very",
]);

function stems(text: string): string[] {
  return (norm(text).match(/[a-z0-9]+/g) || [])
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    .map((t) => t.slice(0, 5));
}

type IndexedChunk = KnowledgeChunk & { tagStems: Set<string>; textStems: Set<string> };

const INDEX: IndexedChunk[] = [...CV_CHUNKS, ...jsonChunks()].map((c) => ({
  ...c,
  tagStems: new Set(stems(c.tags)),
  textStems: new Set(stems(c.text)),
}));

export function selectChunks(question: string, history: ChatMessage[]): KnowledgeChunk[] {
  const previousUser = [...(history || [])]
    .reverse()
    .find((m) => m && m.role === "user" && m.content && m.content.trim() !== question.trim());

  const weights = new Map<string, number>();
  stems(question).forEach((s) => weights.set(s, Math.max(weights.get(s) || 0, 1)));
  if (previousUser) stems(previousUser.content).forEach((s) => weights.set(s, Math.max(weights.get(s) || 0, 0.4)));

  const scored = INDEX.filter((c) => !c.always)
    .map((c, order) => {
      let score = 0;
      weights.forEach((w, s) => {
        if (c.tagStems.has(s)) score += 3 * w;
        else if (c.textStems.has(s)) score += 1 * w;
      });
      return { c, score, order };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  // On écarte les blocs peu pertinents par rapport au meilleur (limite le bruit et les tokens)
  const minScore = scored.length ? Math.max(1.5, 0.35 * scored[0].score) : 0;
  const relevant = scored.filter((x) => x.score >= minScore);

  const selected: KnowledgeChunk[] = INDEX.filter((c) => c.always);
  let size = selected.reduce((n, c) => n + c.text.length, 0);

  const pool = relevant.length ? relevant.map((x) => x.c) : INDEX.filter((c) => c.id === "apercu");
  for (const c of pool) {
    if (selected.length >= MAX_CHUNKS + 2) break;
    if (size + c.text.length > MAX_CONTEXT_CHARS && selected.length > 2) continue;
    selected.push(c);
    size += c.text.length;
  }
  return selected;
}

export function buildSystemPrompt(history: ChatMessage[], question: string, answerLanguage: string): string {
  const context = selectChunks(question, history).map((c) => c.text).join("\n\n");
  return `
Tu es l'assistant du portfolio de ${OWNER_NAME}. Tu réponds aux visiteurs à propos de son
profil, ses expériences, ses compétences et ses projets, en te basant UNIQUEMENT sur les
informations fournies plus bas (une sélection adaptée à la question).

# Fond
- Langue de la réponse : ${answerLanguage}.
- Parle à la première personne, au nom de ${OWNER_NAME} ("j'ai développé...", "mes compétences...").
- Reste factuel : n'invente jamais un nom, une date, un chiffre ou une technologie absents des informations.
- Si deux sources se contredisent, ne tranche pas arbitrairement : donne l'information la plus récente ou la plus précise.
- Si les informations ne contiennent pas la réponse, dis-le en une phrase et propose de contacter
  ${OWNER_NAME} (email ou LinkedIn s'ils apparaissent dans les informations). Ne remplis pas avec des suppositions.
- Ne mentionne jamais "le contexte", "les extraits", "les documents" ou "le JSON" : réponds naturellement.
- Si la question n'a aucun rapport avec le profil de ${OWNER_NAME} (culture générale, hors-sujet) : réponds
  brièvement et poliment en 1 à 3 phrases, sans titre ni emoji.

# Forme (Markdown, lisible d'un coup d'œil)
1. Commence directement par la réponse, en 1 à 2 phrases. Pas de "Bien sûr", "Excellente question" ni de reformulation de la question.
2. Question simple ou factuelle (email, ville, date, une techno) : 1 à 3 phrases, sans titre ni liste.
3. Plusieurs éléments (projets, expériences, compétences, formations) : liste à puces "-".
   Une puce = **Nom en gras** — une phrase courte sur ce que j'ai fait, puis la stack en \`code\` si disponible.
   Ajoute la période entre parenthèses quand elle est connue : **Sup Mti Oujda** (avril–juin 2024).
4. Titres "###" uniquement si la réponse couvre au moins deux catégories distinctes
   (ex. ### Intelligence artificielle, ### Backend et bases de données). Jamais de "#" ni de "##".
5. Les technologies, outils et langages s'écrivent entre \`backticks\`. Le gras sert uniquement aux noms propres (projets, organisations, rôles).
6. Pas de tableau (sauf comparaison explicite demandée), pas de citation de fichier, pas d'emoji.
7. Longueur : 60 à 150 mots par défaut. Va plus loin seulement si le visiteur demande des détails.
8. Évite les répétitions : ne redis pas la même information dans l'intro et dans la liste.
9. Pour une réponse détaillée (liste de plusieurs éléments), termine par UNE phrase courte proposant
   d'approfondir un point précis. Jamais pour une question simple.

# Historique récent de la conversation
${formatHistory(history, question)}

# Informations disponibles
${context}
`.trim();
}