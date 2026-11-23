# RAG pipeline review

Use this reference when tracing an existing implementation or proposing an architecture. Start with the user-visible failure and follow the data path; do not recommend a framework rewrite before locating the faulty stage.

## 1. Ingestion, parsing, and provenance

- Identify supported formats, parser choice, OCR/layout handling, encoding, tables/images, and malformed-file behavior. Compare extracted text with source pages; a successful parse status does not prove usable content.
- Normalize conservatively. Preserve headings, page/section boundaries, table structure, language, and stable source identity when they carry meaning.
- Record source URI/path, document ID, version or content hash, page/section, ingestion timestamp, parser/version, and access-control labels as appropriate. Do not expose internal paths or restricted metadata in user-visible citations.
- Make re-ingestion idempotent. Define how changed, removed, or superseded source documents update/delete their chunks. Watch for stale vectors and duplicate chunks.
- Log counts and quality signals: discovered, parsed, skipped, chunks created, empty/near-empty output, errors, and duration. Avoid logging secrets or full sensitive documents.

## 2. Chunking and metadata

Choose boundaries that preserve answer-bearing units. Fixed token/character windows are a baseline, not a universal optimum. Test recursive/structure-aware splitting against real questions. Tune chunk size, overlap, and parent-child context together; overlap increases storage and can flood results with duplicate evidence.

Metadata should support retrieval filters, deduplication, access control, and citations. Keep types stable and values filterable. Test filters independently because incorrect tenant, date, language, or permission filters can cause silent misses or leaks. Avoid putting high-cardinality or long text fields into filters without checking store behavior.

## 3. Embeddings and vector storage

Compare candidate embedding models on a fixed, representative query/document set, including multilingual, short, ambiguous, and domain-specific cases. Verify normalization and dimensionality, query/document instruction prefixes, model versions, and vector distance metric. Re-embedding or changing dimensions typically requires a deliberate index migration; do not mix incompatible vectors in one collection.

Inspect the configured Chroma collection and embedding function. For example, native Chroma embeds `query_texts` with the collection's configured embedding function; a collection without one needs caller-supplied `query_embeddings`:

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_collection("knowledge")

hits = collection.query(
    query_texts=["How do I rotate an API key?"],
    n_results=8,
    where={"tenant_id": "acme", "language": "en"},
    include=["documents", "metadatas", "distances"],
)
for text, metadata, distance in zip(
    hits["documents"][0], hits["metadatas"][0], hits["distances"][0]
):
    print(metadata.get("source_id"), distance, text[:160])
```

This is a diagnostic sketch: verify the collection's actual embedding function, metadata schema, supported filter expression, and distance semantics. Chroma returns grouped results per query. Smaller distance generally means closer for distance metrics, but it is not automatically a probability or confidence score. Log IDs, metadata, and scores for debugging; do not return raw internal scores as certainty.

## 4. Retrieval, reranking, and failure diagnosis

First measure candidate retrieval before judging the generated answer. Inspect top-k results on good and bad queries, relevant-document rank, duplicate chunks, filter effects, score gaps, and empty results. Distinguish:

- **No evidence in corpus:** source coverage or ingestion problem.
- **Evidence missing from candidates:** chunking, embedding, query mismatch, filter, or candidate-depth problem.
- **Evidence retrieved but not selected:** reranker, deduplication, context budget/order, or prompt construction problem.
- **Evidence present but answer unsupported:** generation instructions, model behavior, or citation/abstention problem.

Use lexical/hybrid retrieval when exact terms, identifiers, or rare names matter; use a cross-encoder or other reranker when candidate recall is adequate but ranking is poor. Compare each addition against a baseline for retrieval metrics, latency, cost, and operational complexity. Query rewriting or multi-query retrieval can improve recall but may broaden noise and must be evaluated.

## 5. Context, generation, and grounding

Build context from the selected, deduplicated evidence with stable IDs and source labels. Enforce a token budget based on the target model and reserve space for instructions and output. Test ordering and truncation; relevant evidence can be lost at the edge of a long prompt. Distinguish trusted instructions from untrusted retrieved text. Ask the model to answer from evidence, cite claims, and abstain or state uncertainty when support is absent. Validate citations against IDs actually supplied to the model.

Example context builder:

```python
def format_context(chunks: list[dict], max_chars: int = 12_000) -> str:
    parts: list[str] = []
    used = 0
    for chunk in chunks:
        source = chunk["metadata"].get("source_id", "unknown")
        text = chunk["text"].strip()
        block = f"[source={source}]\n{text}"
        if used + len(block) > max_chars:
            break
        parts.append(block)
        used += len(block)
    return "\n\n---\n\n".join(parts)
```

Character budgets are a simple illustration; production code should use the target model's tokenizer and account for the full prompt, citations, and output reserve.

## 6. LangGraph orchestration pattern

For a simple, inspectable retrieval-answer workflow, inject the retriever and model rather than hiding globals in graph nodes. A graph helps when explicit state, branching, retries, persistence, or human review is needed; a plain function is often simpler for a one-pass pipeline.

```python
from typing import TypedDict
from langgraph.graph import END, START, StateGraph

class RAGState(TypedDict, total=False):
    question: str
    documents: list
    answer: str

def build_rag_graph(retriever, answer_with_context):
    def retrieve(state: RAGState) -> dict:
        return {"documents": retriever.invoke(state["question"])}

    def generate(state: RAGState) -> dict:
        # answer_with_context should treat documents as untrusted evidence,
        # include source IDs, and support abstention when evidence is weak.
        return {
            "answer": answer_with_context(
                state["question"], state.get("documents", [])
            )
        }

    graph = StateGraph(RAGState)
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    return graph.compile()
```

Keep deterministic validation and access-control checks outside model judgment where feasible. Add conditional routing (for example, retrieve again, abstain, or ask a clarifying question) only with explicit criteria and an evaluation set. If using a checkpointer, decide what state is persisted, how sensitive content is handled, and how long checkpoints are retained; in-memory checkpointing is for local development/testing, not durable production state.

## 7. FastAPI boundary

Keep model/vector clients reusable across requests and inject them through dependencies or application lifespan. Avoid reconstructing an embedding model or database client per request. Validate request size, apply authentication/tenant filters before retrieval, set timeouts, and return a stable response schema with source references. Do not accept a caller-supplied filter as authorization proof.

```python
from typing import Annotated
from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4_000)

class AskResponse(BaseModel):
    answer: str
    source_ids: list[str]

def get_rag_service():
    # In an application, yield/reuse a service created during lifespan.
    return app.state.rag_service

@app.post("/ask", response_model=AskResponse)
def ask(
    body: AskRequest,
    rag=Depends(get_rag_service),
) -> AskResponse:
    result = rag.answer(body.question)
    return AskResponse(answer=result.text, source_ids=result.source_ids)
```

This synchronous example should match the actual client I/O model; use `async def` when awaited operations are genuinely async. In tests, override the service dependency with a deterministic fake. Use FastAPI lifespan for application-scoped resource setup/cleanup and close clients cleanly.

## 8. Explain decisions

For each recommendation, state: (1) evidence observed, (2) the failing stage, (3) why the proposed change targets it, (4) tradeoffs/costs, and (5) how success will be measured. Give a small example with the repository's actual APIs and versions. Label unverified causes as hypotheses and state what log, trace, or experiment would confirm them.
