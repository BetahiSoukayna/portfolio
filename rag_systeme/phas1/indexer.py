import hashlib
import os
from pathlib import Path
from typing import List

import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIR",
    str(Path(__file__).resolve().parent.parent / "chroma_db"),
)
COLLECTION_NAME = os.getenv("CHROMA_COLLECTION", "rag_collection")
JINA_API_KEY = os.getenv("JINA_API_KEY")


class JinaIndexer:
    """Indexe et recherche des morceaux de texte dans ChromaDB."""

    def __init__(self):
        if not JINA_API_KEY:
            raise RuntimeError(
                "La variable JINA_API_KEY doit être définie pour indexer et rechercher les textes."
            )

        Path(CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.embedding_fn = embedding_functions.JinaEmbeddingFunction(
            api_key=JINA_API_KEY,
            model_name="jina-embeddings-v3",
        )
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"Connecté à ChromaDB local ({CHROMA_PERSIST_DIR}). "
            f"Collection '{COLLECTION_NAME}' : {self.collection.count()} chunks."
        )

    @staticmethod
    def generate_unique_id(text: str, metadata: dict) -> str:
        raw = (
            f"{metadata.get('source', 'unknown')}_"
            f"{metadata.get('message_id', '')}_"
            f"{metadata.get('gmail_id', '')}_"
            f"{metadata.get('drive_id', '')}_"
            f"{metadata.get('filename', '')}_"
            f"{metadata.get('chunk_index', 0)}_"
            f"{text[:80]}"
        )
        return hashlib.md5(raw.encode("utf-8")).hexdigest()

    def index_chunks(self, chunks: List[dict]) -> int:
        """Ajoute les morceaux de texte qui ne sont pas déjà indexés."""
        if not chunks:
            return 0

        ids = []
        for index, chunk in enumerate(chunks):
            metadata = dict(chunk.get("metadata") or {})
            metadata["chunk_index"] = index
            chunk["metadata"] = metadata
            ids.append(self.generate_unique_id(chunk.get("text", ""), metadata))

        # Évite les collisions d'identifiants au sein d'un même lot.
        unique_ids = []
        for index, chunk_id in enumerate(ids):
            candidate = chunk_id
            suffix = 1
            while candidate in unique_ids:
                metadata = chunks[index]["metadata"]
                metadata["chunk_index"] = f"{index}_{suffix}"
                candidate = self.generate_unique_id(chunks[index].get("text", ""), metadata)
                suffix += 1
            unique_ids.append(candidate)

        existing = self.collection.get(ids=list(set(unique_ids)))
        existing_ids = set(existing["ids"])

        documents = []
        metadatas = []
        new_ids = []
        for chunk, chunk_id in zip(chunks, unique_ids):
            if chunk_id not in existing_ids:
                documents.append(chunk.get("text", ""))
                metadatas.append(chunk["metadata"])
                new_ids.append(chunk_id)

        if new_ids:
            self.collection.add(documents=documents, metadatas=metadatas, ids=new_ids)
            logger.success(f"{len(new_ids)} nouveaux chunks indexés.")
        else:
            logger.info("Tous les chunks sont déjà indexés.")

        return len(new_ids)


    def delete_by_filename(self, filename: str) -> int:
        """Supprime tous les chunks issus d'un fichier (avant réindexation)."""
        existing = self.collection.get(where={"filename": filename})
        ids = existing.get("ids", [])
        if ids:
            self.collection.delete(ids=ids)
            logger.info(f"{len(ids)} anciens chunks supprimés pour '{filename}'.")
        return len(ids)


_indexer_instance = None


def get_indexer() -> JinaIndexer:
    global _indexer_instance
    if _indexer_instance is None:
        _indexer_instance = JinaIndexer()
    return _indexer_instance


def index_chunks(chunks: List[dict]) -> int:
    return get_indexer().index_chunks(chunks)


def delete_by_filename(filename: str) -> int:
    return get_indexer().delete_by_filename(filename)


def get_collection():
    """Retourne la collection ChromaDB pour effectuer une recherche."""
    return get_indexer().collection


def get_embedding_fn():
    """Retourne la fonction d'embedding configurée pour la collection."""
    return get_indexer().embedding_fn
