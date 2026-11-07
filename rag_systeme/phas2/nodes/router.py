import os
import json
import unicodedata
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

llm_router = ChatGroq(
    model=os.getenv("GROQ_ROUTER_MODEL", "openai/gpt-oss-20b"),
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY"),
    model_kwargs={"response_format": {"type": "json_object"}}
)

def _norm(text: str) -> str:
    text = (text or "").lower().strip()
    text = text.replace("'", "'").replace("'", "'").replace("`", "'")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text

SMALL_TALK = {
    "bonjour", "salut", "hello", "hi", "hey", "salam", "bonsoir",
    "merci", "thanks", "thank you",
    "ça va", "ca va", "cava", "ça va ?", "ca va ?",
    "?", "??", "???", "...",
}

def _is_small_talk(question: str) -> bool:
    return _norm(question) in {_norm(x) for x in SMALL_TALK}

THANKS = {"merci", "thanks", "thank you"}
ENGLISH_GREETINGS = {"hello", "hi", "hey", "thanks", "thank you"}

SMALL_TALK_ANSWERS = {
    "greeting_fr": (
        "Bonjour 👋 Posez-moi vos questions sur mon profil. Par exemple :\n\n"
        "- Mon parcours et ma formation\n"
        "- Mes projets en IA\n"
        "- Mes compétences techniques\n"
        "- Mes expériences et hackathons"
    ),
    "greeting_en": (
        "Hello 👋 Ask me anything about my background. For example:\n\n"
        "- My education and career path\n"
        "- My AI projects\n"
        "- My technical skills\n"
        "- My experience and hackathons"
    ),
    "thanks_fr": "Avec plaisir ! N'hésitez pas si vous avez d'autres questions sur mon profil.",
    "thanks_en": "You're welcome! Feel free to ask if you have more questions about my background.",
}


def _small_talk_answer(question: str) -> str:
    q = _norm(question)
    lang = "en" if q in ENGLISH_GREETINGS else "fr"
    kind = "thanks" if q in {_norm(x) for x in THANKS} else "greeting"
    return SMALL_TALK_ANSWERS[f"{kind}_{lang}"]


# ─── Nom(s) du propriétaire du portfolio ──────────────────────────────────────
# Ajoute ici ton nom, prénom, alias, orthographes possibles (avec fautes de frappe courantes)
OWNER_ALIASES = [
    "soukayna", "soukayna betahi", "betahi soukayna", "betahi",
    "soukyana",  # variante orthographe
]

PORTFOLIO_KEYWORDS = [
    "toi", "tu es", "qui es tu", "qui êtes-vous", "presente toi", "présente-toi",
    "ton profil", "ton parcours", "ta formation", "tes études", "tes etudes",
    "experience", "expérience", "experiences", "expériences",
    "stage", "stages", "pfa", "pfe", "projet", "projets",
    "poste", "job", "travail", "carriere", "carrière",
    "competence", "compétence", "competences", "compétences",
    "skill", "skills", "stack", "technologies", "outils",
    "langage", "langages", "framework", "frameworks",
    "cv", "email", "mail", "contact", "linkedin", "github",
    "portfolio", "site", "numero", "numéro", "telephone", "téléphone",
    "diplome", "diplôme", "universite", "université", "eniad",
    "certification", "certifications", "langue", "langues",
] + OWNER_ALIASES  # ← le nom du propriétaire compte comme mot-clé portfolio

def _looks_like_portfolio_question(question: str) -> bool:
    q = _norm(question)
    return any(_norm(k) in q for k in PORTFOLIO_KEYWORDS)

def _mentions_owner(question: str) -> bool:
    q = _norm(question)
    return any(_norm(alias) in q for alias in OWNER_ALIASES)


ROUTER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
Tu es le routeur d'un assistant de portfolio personnel (chatbot qui répond
aux questions des visiteurs sur le profil, les expériences, les compétences
et les projets du propriétaire du portfolio, qui s'appelle Soukayna Betahi).

Réponds uniquement en JSON strict, sans texte autour :
{{
  "type": "portfolio" | "small_talk" | "general",
  "search_query": "question reformulée et optimisée pour une recherche RAG"
}}

Règles :
- "portfolio" : la question porte sur le profil, l'expérience, les études,
  les compétences, les projets, les certifications, les coordonnées
  (email, LinkedIn, GitHub, CV) du propriétaire du portfolio (Soukayna Betahi).
  Toute question contenant "Soukayna", "Betahi", "qui est-elle", "qui es-tu",
  "toi" est TOUJOURS classée "portfolio", jamais "small_talk".
- "small_talk" : UNIQUEMENT salutations, remerciements, politesse pure
  (bonjour, merci, ça va), sans aucune question de fond.
- "general" : question qui n'a rien à voir avec Soukayna Betahi
  (culture générale, actualité, questions hors-sujet).
- Ne jamais inventer d'informations sur le profil, uniquement classifier et
  reformuler la question de recherche.
"""),
    ("human", """
Historique de la conversation :
{history}

Question du visiteur :
{question}
""")
])

router_chain = ROUTER_PROMPT | llm_router


def router_node(state: dict) -> dict:
    question = state["question"]
    history = state.get("history", []) or []

    logger.info(f"Routeur portfolio — Analyse de : {question[:80]}")

    # 1) Small talk pur → réponse directe, pas de RAG
    if _is_small_talk(question):
        return {
            **state,
            "question_type": "small_talk",
            "search_query": question,
            "needs_rag": False,
            "answer": _small_talk_answer(question),
            "sources": [],
            "confidence": 1.0,
        }

    # 2) Court-circuit : si le nom du propriétaire est mentionné,
    #    on force le type "portfolio" sans dépendre du LLM
    if _mentions_owner(question):
        logger.info("Routeur → nom du propriétaire détecté, type forcé à 'portfolio'.")
        return {
            **state,
            "question": question,
            "question_type": "portfolio",
            "search_query": question,
            "needs_rag": True,
            "retrieval_attempts": 0,
        }

    # 3) Historique formaté pour le LLM
    history_text = ""
    for msg in history[-8:]:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role and content:
            history_text += f"{role}: {content}\n"

    # 4) Appel LLM pour classifier + reformuler (cas restants)
    try:
        response = router_chain.invoke({
            "question": question,
            "history": history_text,
        })
        decision = json.loads(response.content)
    except Exception as e:
        logger.error(f"Erreur routage : {e}")
        decision = {
            "type": "portfolio" if _looks_like_portfolio_question(question) else "general",
            "search_query": question,
        }

    question_type = decision.get("type", "portfolio")
    search_query = decision.get("search_query") or question

    needs_rag = question_type == "portfolio"

    logger.info(
        f"Routeur → type={question_type}, needs_rag={needs_rag}, query={search_query}"
    )

    return {
        **state,
        "question": question,
        "question_type": question_type,
        "search_query": search_query,
        "needs_rag": needs_rag,
        "retrieval_attempts": 0,
    }