import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger

from phas2.formatting import clean_answer

llm_generateur = ChatGroq(
    model=os.getenv("GROQ_GENERATOR_MODEL", "openai/gpt-oss-120b"),
    temperature=0.3,
    api_key=os.getenv("GROQ_API_KEY"),
)

GENERATEUR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
Tu es l'assistant du portfolio de {owner_name}. Tu réponds aux visiteurs à propos de son
profil, ses expériences, ses compétences et ses projets, en te basant UNIQUEMENT sur les
extraits fournis plus bas.

# Fond
- Langue de la réponse : {answer_language}.
- Parle à la première personne, au nom de {owner_name} ("j'ai développé...", "mes compétences...").
- Reste factuel : n'invente jamais un nom, une date, un chiffre ou une technologie absents des extraits.
- Si deux extraits se contredisent, ne tranche pas arbitrairement : donne l'information la plus récente ou la plus précise.
- Si les extraits ne contiennent pas la réponse, dis-le en une phrase et propose de contacter
  {owner_name} (email ou LinkedIn s'ils apparaissent dans les extraits). Ne remplis pas avec des suppositions.
- Ne mentionne jamais "le contexte", "les extraits", "les documents" ou "le JSON" : réponds naturellement.

# Forme (Markdown, lisible d'un coup d'œil)
1. Commence directement par la réponse, en 1 à 2 phrases. Pas de "Bien sûr", "Excellente question" ni de reformulation de la question.
2. Question simple ou factuelle (email, ville, date, une techno) : 1 à 3 phrases, sans titre ni liste.
3. Plusieurs éléments (projets, expériences, compétences, formations) : liste à puces "-".
   Une puce = **Nom en gras** — une phrase courte sur ce que j'ai fait, puis la stack en `code` si disponible.
   Ajoute la période entre parenthèses quand elle est connue : **Sup Mti Oujda** (avril–juin 2024).
4. Titres "###" uniquement si la réponse couvre au moins deux catégories distinctes
   (ex. ### Intelligence artificielle, ### Backend et bases de données). Jamais de "#" ni de "##".
5. Les technologies, outils et langages s'écrivent entre `backticks`. Le gras sert uniquement aux noms propres (projets, organisations, rôles).
6. Pas de tableau (sauf comparaison explicite demandée), pas de citation de fichier, pas d'emoji.
7. Longueur : 60 à 150 mots par défaut. Va plus loin seulement si le visiteur demande des détails.
8. Évite les répétitions : ne redis pas la même information dans l'intro et dans la liste.
9. Pour une réponse détaillée (liste de plusieurs éléments), termine par UNE phrase courte proposant
   d'approfondir un point précis. Jamais pour une question simple.

# Historique récent de la conversation
{history}

# Extraits disponibles
{context}
"""),
    ("human", "{question}")
])

generateur_chain = GENERATEUR_PROMPT | llm_generateur

OWNER_NAME = os.getenv("PORTFOLIO_OWNER_NAME", "Soukayna Betahi")

MAX_CONTEXT_DOCS = 6
MAX_HISTORY_TURNS = 6


def _format_history(history: list, question: str) -> str:
    """Derniers échanges, sans répéter la question courante si le front l'a déjà ajoutée."""
    msgs = [m for m in (history or []) if m.get("content")]
    if msgs and msgs[-1].get("role") == "user" and msgs[-1]["content"].strip() == question.strip():
        msgs = msgs[:-1]
    msgs = msgs[-MAX_HISTORY_TURNS:]
    if not msgs:
        return "(aucun)"
    return "\n".join(
        f"{'Visiteur' if m.get('role') == 'user' else 'Assistant'} : {m['content'][:600]}"
        for m in msgs
    )


def _format_context(docs: list) -> str:
    if not docs:
        return "Aucun extrait disponible."
    blocks = []
    for i, d in enumerate(docs[:MAX_CONTEXT_DOCS], start=1):
        meta = d.get("metadata") or {}
        source = meta.get("filename") or meta.get("source") or "portfolio"
        blocks.append(f"[Extrait {i} — {source}]\n{d['text']}")
    return "\n\n".join(blocks)


def generateur_node(state: dict) -> dict:
    """Génère la réponse finale en Markdown structuré à partir des chunks récupérés (RAG)."""
    question = state.get("question", "")
    retrieved_docs = state.get("retrieved_docs", [])
    answer_language = state.get("answer_language", "French")

    logger.info(f"Generateur — génération réponse ({answer_language}) avec {len(retrieved_docs)} chunks.")

    try:
        response = generateur_chain.invoke({
            "question": question,
            "context": _format_context(retrieved_docs),
            "history": _format_history(state.get("history", []), question),
            "answer_language": answer_language,
            "owner_name": OWNER_NAME,
        })
        answer = clean_answer(response.content)
        confidence = 0.9 if retrieved_docs else 0.4
    except Exception as e:
        logger.error(f"Erreur génération : {e}")
        answer = "Désolé, une erreur est survenue lors de la génération de la réponse."
        confidence = 0.0

    return {
        **state,
        "answer": answer,
        "confidence": confidence,
    }
