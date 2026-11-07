from typing import TypedDict, List, Optional, Dict, Any


class PortfolioState(TypedDict, total=False):
    # ─── Entrée ───────────────────────────────────────────────────────────────
    question: str
    history: List[Dict[str, str]]          
    # ─── Routage ──────────────────────────────────────────────────────────────
    question_type: str                     
    search_query: str
    needs_rag: bool
    answer_language: str                   

    retrieved_docs: List[Dict[str, Any]]  
    sources: List[str]
    retrieval_attempts: int
    grade_passed: bool

    answer: str
    confidence: float