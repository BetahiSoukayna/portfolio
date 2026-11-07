from pathlib import Path
from loguru import logger

from phas1.peipline import process_file

# Chemin absolu basé sur l'emplacement de ce fichier, peu importe d'où on lance le script
DATA_DIR = Path(__file__).resolve().parent / "data"


def ingest_data_folder(data_dir: Path = DATA_DIR):
    if not data_dir.exists():
        logger.error(f"Dossier introuvable : {data_dir}")
        return

    results = []

    for file_path in sorted(data_dir.iterdir()):
        if not file_path.is_file():
            continue

        result = process_file(str(file_path))

        if result and result.get("status") == "success":
            logger.success(
                f"✓ {result['filename']} → {result['chunks_indexed']} chunks indexés."
            )
            results.append(result)
        else:
            logger.warning(f"✗ {file_path.name} n'a pas été indexé.")

    total = sum(r["chunks_indexed"] for r in results)
    logger.info(f"Ingestion terminée. {len(results)} fichiers traités, {total} chunks au total.")


if __name__ == "__main__":
    ingest_data_folder()