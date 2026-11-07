import os
import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger

llm_grader = ChatGroq(
    model=os.getenv("GROQ_GRADER_MODEL", "openai/gpt-oss-20b"),
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY"),
    model_kwargs={"response_format": {"type": "json_object"}}
)

GRADER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
Tu évalues si les documents récupérés contiennent l'information demandée
par le visiteur d'un portfolio personnel.

Réponds uniquement en JSON strict :
{{
  "relevant": true | false,
  "reason": "courte justification"
}}

Règles strictes :
- relevant=true dès que l'information demandée (ou une info clairement liée)
  apparaît QUELQUE PART dans les documents, même une seule fois, même dans
  un seul chunk parmi plusieurs.
- Le fait qu'une info apparaisse dans plusieurs sections ou plusieurs fichiers
  n'est JAMAIS une raison de rejet — c'est au contraire un signal positif.
- Ne rejette QUE si l'information demandée est absente de tous les documents.
- Sois permissif : en cas de doute, réponds relevant=true.
"""),
    ("human", """
Question : {question}

Documents récupérés :
{documents}
""")
])

grader_chain = GRADER_PROMPT | llm_grader

MAX_RETRIEVAL_ATTEMPTS = 2


def grader_node(state: dict) -> dict:
   
    question = state.get("question", "")
    retrieved_docs = state.get("retrieved_docs", [])
    attempts = state.get("retrieval_attempts", 0)

    if not retrieved_docs:
        logger.warning("Grader → aucun document récupéré.")
        relevant = False
    else:
        documents_text = "\n---\n".join(d["text"][:500] for d in retrieved_docs[:5])
        try:
            response = grader_chain.invoke({
                "question": question,
                "documents": documents_text,
            })
            decision = json.loads(response.content)
            relevant = bool(decision.get("relevant", False))
            logger.info(f"Grader → relevant={relevant} | reason={decision.get('reason')}")
        except Exception as e:
            logger.error(f"Erreur grading : {e}")
            # En cas d'échec du LLM, on suppose pertinent pour ne pas bloquer le flux
            relevant = True

    if relevant:
        return {**state, "grade_passed": True}

    if attempts < MAX_RETRIEVAL_ATTEMPTS:
        logger.info("Grader → non pertinent, nouvelle tentative de retrieval.")
        return {**state, "grade_passed": False, "needs_rag": True}

    logger.info("Grader → non pertinent après max tentatives, fallback général.")
    return {**state, "grade_passed": False, "needs_rag": False, "question_type": "general"}