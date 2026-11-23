# RAG audit and evaluation

Use this reference for architecture audits, acceptance criteria, regression suites, and diagnosing groundedness failures. Evaluate stages separately before relying on a single end-to-end score.

## Systematic RAG audit checklist

Record evidence, status (`pass`, `fail`, `unknown`, or `not applicable`), severity, and an owner/next action for each relevant item. `Unknown` is a finding when the system cannot expose the needed evidence.

### A. Scope and architecture

- [ ] Define users, supported questions, out-of-scope questions, languages, freshness needs, availability target, and sensitive-data constraints.
- [ ] Draw the real path from request to response, including sync/async boundaries, queues, caches, model providers, vector stores, and fallback paths.
- [ ] Identify framework and service versions, model names/versions, embedding configuration, index settings, prompts, and environment-specific differences.
- [ ] Identify trust boundaries and which components can access each tenant's data or call external tools.

### B. Ingestion and corpus quality

- [ ] List every source type and verify parser/OCR coverage, extraction quality, tables/images, encoding, and malformed/empty file handling.
- [ ] Compare extracted content with representative originals, including difficult pages and languages.
- [ ] Verify deduplication, stable document IDs, content hashes/versioning, deletion/update behavior, idempotent re-ingestion, and stale-vector cleanup.
- [ ] Verify ingestion errors and skipped records are visible through metrics/logs without exposing secrets or sensitive body text.
- [ ] Verify permissions and metadata survive parsing, splitting, embedding, storage, retrieval, and citation creation.

### C. Chunk and metadata design

- [ ] Inspect chunk boundaries for representative answer-bearing passages, headers, tables, and cross-page content.
- [ ] Record chunk length distribution, overlap, empty/oversized chunks, duplicate rate, and parent-child strategy.
- [ ] Verify metadata schema, types, required keys, stable source/page/section IDs, timestamps, language, and access labels.
- [ ] Verify filters are correct, tested, indexed where relevant, and applied before unauthorized content can enter the prompt.

### D. Embeddings and index

- [ ] Confirm query and document embedding model, provider, version, dimensions, normalization/instructions, language coverage, and model/index compatibility.
- [ ] Confirm collection/index identity, distance metric, persistence, update semantics, index parameters, and migration/rebuild plan.
- [ ] Check batch sizing, retry/rate limit behavior, partial-write recovery, and index build/rebuild observability.
- [ ] Benchmark target-domain retrieval examples; do not use model reputation or uncalibrated similarity thresholds as proof of fit.

### E. Retrieval and ranking

- [ ] Verify query preprocessing/rewrite behavior and retain the original query for tracing.
- [ ] Inspect top-k candidates and scores for representative successes, failures, rare terms, filters, no-answer queries, and multi-hop questions.
- [ ] Measure recall@k / hit rate using labeled relevant source IDs; inspect reciprocal rank or nDCG when ordering matters.
- [ ] Check metadata filter correctness, empty-result behavior, duplicate suppression, candidate depth, and latency.
- [ ] Evaluate lexical/hybrid retrieval, query expansion, or reranking only against a stable baseline; report gains and added cost/latency.

### F. Context and generation

- [ ] Verify selected passages are the ones actually passed to the model, with source IDs and no accidental truncation.
- [ ] Measure prompt tokens and reserve capacity for instructions and answer; inspect ordering and context dilution.
- [ ] Make evidence untrusted input: delimit it, tell the model not to follow embedded instructions, and keep tool permissions outside retrieved content.
- [ ] Test grounded answers, incomplete evidence, conflicting documents, stale sources, ambiguous questions, and unsupported questions.
- [ ] Check factual correctness, faithfulness to context, citation validity/coverage, calibrated uncertainty, and abstention behavior.
- [ ] Verify model timeout, retry, rate limit, malformed response, refusal, and provider outage behavior.

### G. Agent graph and API

- [ ] Make graph state, nodes, routing conditions, retry limits, and terminal paths inspectable; ensure loops have bounds.
- [ ] Distinguish session history, durable user memory, and retrieved knowledge. Persist only what the feature needs; establish retention and access controls.
- [ ] Ensure model output cannot bypass authorization, validation, or deterministic business rules.
- [ ] Validate request size/schema, authentication, tenant scoping, rate limits, timeouts, response schema, and safe error behavior.
- [ ] Test API dependency overrides with fakes; verify resources are created/reused/closed through app lifespan.
- [ ] Check logs/traces include request and retrieval identifiers, latency, token/cost information, model/index/prompt versions, and outcome labels while excluding secrets and unnecessary PII.

### H. Evaluation and operations

- [ ] Maintain a versioned dataset with expected evidence IDs and answer criteria; include positive, negative, adversarial, multilingual, and edge cases.
- [ ] Separate ingestion, retrieval, reranking, answer, citation, API, and operational tests so a failure points to a stage.
- [ ] Establish baseline metrics and acceptance thresholds from product requirements and observed variance, not arbitrary universal cutoffs.
- [ ] Track latency percentiles, cost, errors, empty retrieval, abstention, and quality regressions by model/index/prompt version.
- [ ] Define rollback or reindex plans for prompt, embedding, chunking, model, and corpus changes.

## Evaluation dataset and metrics

Represent each example with a query, expected answer or rubric, one or more relevant source/chunk IDs, required citations, and tags (language, difficulty, tenant/filter, answerable, risk type). Keep private data protected. Split examples so prompt tuning does not leak the final evaluation set.

Useful stage metrics include:

- **Ingestion:** source coverage, parse success, empty/duplicate rate, update/delete correctness.
- **Retrieval:** hit rate/recall@k, MRR, nDCG, filter correctness, empty-result rate, and candidate latency.
- **Reranking:** change in rank of relevant evidence and relevance at the context cutoff.
- **Generation:** answer correctness against the rubric, faithfulness/support, citation precision/recall, abstention quality, and unsupported-claim rate.
- **Operations:** p50/p95 latency, timeouts, error rate, token use, provider/vector cost, and index freshness.

LLM judges can help triage nuanced outputs but can be inconsistent or biased. Calibrate them on human-reviewed examples, retain the rubric and judge/model version, and periodically compare to human labels. Use deterministic checks for citation IDs, schema, filters, and known-answer assertions. Report distributions and representative misses in addition to averages.

## Practical tests

Keep core checks fast and deterministic. Test against an isolated temporary collection or a fake store; avoid a production index and remote model in ordinary unit tests. Pin model/index/prompt versions in evaluation reports. For integration tests, use a small fixture corpus and mark network-dependent calls explicitly.

Example retrieval evaluation from known relevant IDs:

```python
def recall_at_k(retrieved_ids: list[str], relevant_ids: set[str], k: int) -> float:
    if not relevant_ids:
        raise ValueError("Each answerable query needs at least one relevant ID")
    return len(set(retrieved_ids[:k]) & relevant_ids) / len(relevant_ids)

def test_known_policy_question_hits_source(retriever):
    docs = retriever.invoke("How long do I have to report an incident?")
    retrieved = [doc.metadata["chunk_id"] for doc in docs]
    assert recall_at_k(retrieved, {"incident-policy-4"}, k=5) == 1.0
```

This exact-source test is appropriate only when the fixture has stable IDs and known evidence. For production corpora, use judged relevance sets and trend metrics; do not require one exact chunk if multiple chunks support the answer.

Example Chroma filter isolation test (use a disposable local/temporary client and deterministic embeddings):

```python
def test_tenant_filter_excludes_other_tenant(collection):
    result = collection.query(
        query_texts=["retention policy"],
        n_results=10,
        where={"tenant_id": "tenant-a"},
        include=["metadatas"],
    )
    assert all(meta["tenant_id"] == "tenant-a" for meta in result["metadatas"][0])
```

This verifies filter behavior for the fixture; separately test that authenticated identity determines the filter and that callers cannot override it.

Example answer/citation contract test with a fake deterministic service:

```python
from fastapi.testclient import TestClient

def test_ask_returns_only_known_sources(app, fake_rag_service):
    app.dependency_overrides[get_rag_service] = lambda: fake_rag_service
    try:
        response = TestClient(app).post(
            "/ask", json={"question": "What is the retention period?"}
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["source_ids"] == ["retention-policy-2"]
    assert body["answer"]
```

Also test empty evidence, unsupported questions, malformed model output, timeout/error mapping, oversized input, and authorization boundaries. Keep the test fixture service independent of external providers.

## Triage order for a bad answer

1. Is the needed fact present in the current source corpus? If not, fix scope or ingestion.
2. Did parsing preserve it correctly? If not, fix extraction/normalization.
3. Does an expected relevant chunk exist with correct metadata? If not, fix splitting/indexing.
4. Does retrieval return it before the context cutoff? If not, inspect query, embedding, filters, metric, candidate depth, and ranking.
5. Did the actual prompt include the relevant passage and source identity? If not, fix selection, deduplication, ordering, or token budgeting.
6. Did the model answer from the evidence and cite it correctly? If not, inspect prompt, model, answer validation, and abstention policy.
7. Did the service return the correct result to the right caller within limits? If not, inspect API, auth, concurrency, retries, timeouts, and cache behavior.

Change one major factor at a time where possible, rerun the relevant stage suite, then run end-to-end regression examples. Report both improvements and regressions, plus latency/cost tradeoffs.
