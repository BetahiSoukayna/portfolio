import re
import unicodedata
from loguru import logger


def _norm(text: str) -> str:
    text = (text or "").lower().strip()
    text = unicodedata.normalize("NFD", text)
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


# Mots fréquents NON ambigus (on évite "a", "on", "me", "an"... présents dans les deux langues)
FRENCH_WORDS = {
    "le", "la", "les", "un", "une", "des", "du", "de", "et", "est", "sont", "es",
    "tu", "ton", "ta", "tes", "vous", "votre", "vos", "avez", "as", "ai",
    "qui", "que", "quoi", "quel", "quelle", "quels", "quelles", "quand", "ou",
    "comment", "pourquoi", "combien", "avec", "pour", "dans", "sur", "chez",
    "parle", "presente", "peux", "peut", "projet", "projets", "competences",
    "experience", "experiences", "formation", "etudes", "parcours", "sais",
    "fais", "faites", "travaille", "travaille", "stage", "j", "t", "qu",
}

ENGLISH_WORDS = {
    "the", "and", "is", "are", "you", "your", "do", "does", "did", "have", "has",
    "what", "which", "who", "whom", "where", "when", "why", "how", "with", "for",
    "about", "tell", "can", "could", "would", "any", "her", "she", "his", "he",
    "projects", "project", "skills", "experience", "experiences", "studies",
    "work", "worked", "working", "background", "education", "of", "to", "in",
    "hello", "thanks", "thank",
}

_ARABIC = re.compile(r"[\u0600-\u06FF]")


def langage_node(state: dict) -> dict:
    """
    Détecte la langue de la question pour que le générateur réponde
    dans la même langue que le visiteur (français, anglais ou arabe).
    """
    question = state.get("question", "")

    if _ARABIC.search(question):
        lang = "Arabic"
    else:
        tokens = re.findall(r"[a-z]+", _norm(question))
        fr = sum(t in FRENCH_WORDS for t in tokens)
        en = sum(t in ENGLISH_WORDS for t in tokens)

        if en > fr:
            lang = "English"
        elif fr > en:
            lang = "French"
        else:
            # Ambigu → on garde la langue déjà détectée, sinon français par défaut
            lang = state.get("answer_language", "French")

    logger.info(f"Langage détecté : {lang}")
    return {**state, "answer_language": lang}
