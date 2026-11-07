from langgraph.graph import StateGraph, END
from loguru import logger

from .state import PortfolioState
from .nodes.router import router_node
from .nodes.language import langage_node
from .nodes.retriever import retriever_node
from .nodes.grader import grader_node
from .nodes.generator import generateur_node
from .nodes.general import general_node


# ─── Conditions de branchement ────────────────────────────────────────────────

def route_after_router(state: PortfolioState) -> str:
    """Après le router : small_talk termine direct, sinon on passe par langage."""
    if state.get("question_type") == "small_talk":
        return "end"
    return "langage"


def route_after_langage(state: PortfolioState) -> str:
    """Après détection de langue : RAG si portfolio, sinon réponse générale directe."""
    if state.get("needs_rag"):
        return "retriever"
    return "general"


def route_after_grader(state: PortfolioState) -> str:
    
    if state.get("grade_passed"):
        return "generateur"
    if state.get("needs_rag"):
        return "retriever"
    return "general"


# ─── Construction du graphe ───────────────────────────────────────────────────

def build_graph():
    graph = StateGraph(PortfolioState)

    graph.add_node("router", router_node)
    graph.add_node("langage", langage_node)
    graph.add_node("retriever", retriever_node)
    graph.add_node("grader", grader_node)
    graph.add_node("generateur", generateur_node)
    graph.add_node("general", general_node)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        route_after_router,
        {
            "end": END,
            "langage": "langage",
        },
    )

    graph.add_conditional_edges(
        "langage",
        route_after_langage,
        {
            "retriever": "retriever",
            "general": "general",
        },
    )

    graph.add_edge("retriever", "grader")

    graph.add_conditional_edges(
        "grader",
        route_after_grader,
        {
            "generateur": "generateur",
            "retriever": "retriever",
            "general": "general",
        },
    )

    graph.add_edge("generateur", END)
    graph.add_edge("general", END)

    compiled = graph.compile()
    logger.info("Graph portfolio compilé avec succès.")
    return compiled


portfolio_graph = build_graph()