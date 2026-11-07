import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
from dotenv import load_dotenv
from phas2.graph import portfolio_graph

load_dotenv()

app = FastAPI(
    title="Portfolio RAG Assistant",
    description="API du chatbot qui répond aux questions sur mon profil et mes projets",
    version="1.0.0",
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_HISTORY_MESSAGES = 20


# ─── Schémas alignés avec route.ts (Next.js) ─────────────────────────────────
class ChatMessage(BaseModel):
    role: str        # "user" | "assistant"
    content: str


class RagQueryRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class RagQueryResponse(BaseModel):
    response: str
    sources: List[str] = []


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/rag/query", response_model=RagQueryResponse)
def rag_query(request: RagQueryRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas être vide.")

    logger.info(f"Question reçue : {request.message[:80]}")

    history = [{"role": m.role, "content": m.content} for m in request.history]
    history = history[-MAX_HISTORY_MESSAGES:]

    try:
        initial_state = {
            "question": request.message,
            "history": history,
            "retrieval_attempts": 0,
        }
        result = portfolio_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"Erreur graph : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne lors du traitement de la question.")

    answer = result.get("answer", "Désolé, je n'ai pas pu générer de réponse.")
    sources = result.get("sources", [])

    logger.info(f"Réponse générée (type={result.get('question_type')}, confidence={result.get('confidence')})")

    return RagQueryResponse(
        response=answer,
        sources=sources,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)