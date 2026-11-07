from loguru import logger
from phas1.indexer import get_collection  
import time

def retriever_node(state: dict) -> dict:
    search_query = state.get("search_query") or state.get("question", "")
    attempts = state.get("retrieval_attempts", 0)

    logger.info(f"Retriever — query='{search_query[:80]}' (tentative {attempts + 1})")

    collection = get_collection()
    max_retries = 2
    results = None

    for i in range(max_retries):
        try:
            results = collection.query(query_texts=[search_query], n_results=5)
            break
        except Exception as e:
            logger.warning(f"Tentative réseau {i+1}/{max_retries} échouée : {e}")
            if i < max_retries - 1:
                time.sleep(1)

    if results is None:
        logger.error("Erreur retrieval après retries réseau.")
        return {
            **state,
            "retrieved_docs": [],
            "sources": [],
            "retrieval_attempts": attempts + 1,
        }

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    retrieved_docs = [
        {"text": doc, "metadata": meta, "distance": dist}
        for doc, meta, dist in zip(docs, metas, distances)
    ]
    sources = [meta.get("filename") or meta.get("source") or "portfolio" for meta in metas]

    logger.info(f"Retriever → {len(retrieved_docs)} chunks trouvés.")

    return {
        **state,
        "retrieved_docs": retrieved_docs,
        "sources": list(dict.fromkeys(sources)),
        "retrieval_attempts": attempts + 1,
    }