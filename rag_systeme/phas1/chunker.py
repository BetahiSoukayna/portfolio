from langchain_text_splitters import RecursiveCharacterTextSplitter
from loguru import logger


def create_chunks(markdown_text: str, metadata: dict):
    logger.debug("===== DEBUG CHUNKER START =====")
    logger.debug(f"Longueur markdown : {len(markdown_text)} caractères")
    logger.debug(f"Metadata reçue : {metadata}")


    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n## ", "\n### ", "\n\n", ". ", "\n", " "]
    )

    chunks = text_splitter.create_documents([markdown_text], metadatas=[metadata])

    logger.info(f"Découpage terminé : {len(chunks)} morceaux créés.")

    for i, chunk in enumerate(chunks, start=1):
        content = chunk.page_content

        logger.debug("=" * 80)
        logger.debug(f"CHUNK {i}/{len(chunks)}")
        logger.debug(f"Taille chunk : {len(content)} caractères")
        logger.debug(f"Metadata chunk : {chunk.metadata}")
        logger.debug(content[:1200])
        
    logger.debug("===== DEBUG CHUNKER END =====")

    return chunks