from phas2.graph import portfolio_graph
from loguru import logger
import sys

logger.remove()
logger.add(sys.stdout, level="DEBUG")

questions = [
    "Présente-toi",
    "Quelles sont tes compétences techniques ?",
    "As-tu travaillé sur des projets en IA ?",
    "Bonjour",
    "Do you have experience with LangGraph?",
    "Quels sont tes projets ?",
]

for q in questions:
    print("\n" + "="*60)
    print(f"QUESTION : {q}")
    state = {
        "question": q,
        "history": [],
        "retrieval_attempts": 0
    }
    result = portfolio_graph.invoke(state)
    print(f"Réponse : {result.get('answer')}")
    print(f"Sources : {result.get('sources')}")
    print(f"Type de question : {result.get('question_type')}")
    print(f"Confiance : {result.get('confidence')}")
    print("État complet :", result.keys())