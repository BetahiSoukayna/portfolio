FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CHROMA_PERSIST_DIR=/app/rag_systeme/chroma_db

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY rag_systeme ./rag_systeme

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --app-dir /app/rag_systeme --host 0.0.0.0 --port ${PORT:-8000}"]
