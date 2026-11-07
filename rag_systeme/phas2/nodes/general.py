import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger

from phas2.formatting import clean_answer

llm_general = ChatGroq(
    model=os.getenv("GROQ_GENERAL_MODEL", "openai/gpt-oss-20b"),
    temperature=0.4,
    api_key=os.getenv("GROQ_API_KEY"),
)

GENERAL_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
Tu es l'assistant du portfolio de {owner_name}. Le visiteur pose une question
qui ne concerne pas directement le profil, les expériences ou les projets de
{owner_name} (culture générale, question hors-sujet, ou information absente
du portfolio).

Règles :
- Réponds brièvement et poliment dans la langue : {answer_language}.
- Si la question semblait porter sur {owner_name} mais que l'info manque,
  dis-le honnêtement et invite à le/la contacter directement.
- Sinon, réponds normalement à la question générale, en restant concis.
- Format Markdown simple : une réponse directe en 1 à 3 phrases ; une liste à puces "-" seulement
  si la réponse contient plusieurs éléments. Pas de titres, pas d'emoji.
"""),
    ("human", "{question}")
])

general_chain = GENERAL_PROMPT | llm_general

OWNER_NAME = os.getenv("PORTFOLIO_OWNER_NAME", "Soukayna Betahi")


def general_node(state: dict) -> dict:
    """
    Répond sans contexte RAG : questions hors-sujet ou fallback quand
    le grader n'a rien trouvé de pertinent dans le portfolio.
    """
    question = state.get("question", "")
    answer_language = state.get("answer_language", "French")

    logger.info(f"General — réponse directe LLM ({answer_language}).")

    try:
        response = general_chain.invoke({
            "question": question,
            "answer_language": answer_language,
            "owner_name": OWNER_NAME,
        })
        answer = clean_answer(response.content)
    except Exception as e:
        logger.error(f"Erreur general_node : {e}")
        answer = "Désolé, je n'ai pas pu traiter votre question."

    return {
        **state,
        "answer": answer,
        "sources": [],
        "confidence": 0.5,
    }