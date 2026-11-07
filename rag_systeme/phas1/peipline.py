import re
from pathlib import Path
from loguru import logger
from phas1.extractors import pdf_extractor,text_extractor
from phas1.extractors.image import extract_text_from_image
from phas1.chunker import create_chunks
from .indexer import index_chunks, delete_by_filename
import json


def extract_txt(file_path: str) -> dict:
    """Extracteur simple pour les fichiers texte brut (.txt)."""
    path = Path(file_path)
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    return {
        "markdown": f"# {path.stem}\n\n{content}",
        "metadata": {"source": str(path), "file_type": "txt"}
    }



SECTION_LABELS = {
    "personal": "Profil",
    "experiences": "Expériences",
    "projects": "Projets",
    "skills": "Compétences",
    "education": "Formation",
    "certifications": "Certifications",
    "languages": "Langues",
    "contact": "Contact",
}

FIELD_LABELS = {
    "name": "Nom", "title": "Titre", "email": "Email", "phone": "Téléphone",
    "location": "Lieu", "about": "À propos", "type": "Type", "organizer": "Organisateur",
    "role": "Rôle", "date": "Date", "duration": "Durée", "description": "Description",
    "result": "Résultat", "technologies": "Technologies", "certification": "Certification",
    "linkedin": "LinkedIn", "github": "GitHub", "link": "Lien", "url": "Lien",
    "programming": "Langages de programmation", "ai_ml": "IA / Machine Learning",
    "tools": "Outils",
}

TYPE_LABELS = {
    "hackathon": "Hackathon", "formation": "Formation", "club_event": "Événement de club",
    "orientation": "Orientation / ambassadrice", "internship": "Stage", "project": "Projet",
}


def _label(key: str, labels: dict = None) -> str:
    labels = labels or FIELD_LABELS
    return labels.get(key, key.replace("_", " ").capitalize())


def _scalar(value) -> str:
    if isinstance(value, bool):
        return "Oui" if value else "Non"
    if isinstance(value, list):
        return ", ".join(_scalar(v) for v in value)
    return str(value)


def _bullets(data: dict, skip: tuple = ()) -> list:
    """Transforme un dict plat en lignes '- **Libellé** : valeur'."""
    lines = []
    for key, value in data.items():
        if key in skip or value in (None, "", []):
            continue
        if key == "type":
            value = TYPE_LABELS.get(value, value)
        if isinstance(value, dict):
            inner = ", ".join(f"{_label(k)} : {_scalar(v)}" for k, v in value.items() if v not in (None, ""))
            lines.append(f"- **{_label(key)}** : {inner}")
        else:
            lines.append(f"- **{_label(key)}** : {_scalar(value)}")
    return lines


def extract_json(file_path: str) -> dict:
    """
    Convertit data_portfolio.json en Markdown structuré pour l'indexation.

    Chaque élément d'une liste (expérience, projet...) devient un bloc
    '### <Section> — <Nom>' autonome : le chunker peut ainsi le séparer
    sans perdre le contexte (de quelle section il vient, comment il s'appelle).
    Fonctionne avec n'importe quelle clé que vous ajoutez au JSON.
    """
    path = Path(file_path)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    owner = (data.get("personal") or {}).get("name", "")
    parts = [f"# Informations complémentaires{' — ' + owner if owner else ''}"]

    for section, value in data.items():
        section_label = _label(section, SECTION_LABELS)

        if isinstance(value, list) and value and all(isinstance(v, dict) for v in value):
            parts.append(f"## {section_label}")
            for i, item in enumerate(value, start=1):
                item_name = item.get("name") or item.get("title") or f"{section_label} {i}"
                block = [f"### {section_label} — {item_name}"]
                block += _bullets(item, skip=("name", "title"))
                parts.append("\n".join(block))

        elif isinstance(value, dict):
            block = [f"## {section_label}"] + _bullets(value)
            parts.append("\n".join(block))

        elif isinstance(value, list):
            block = [f"## {section_label}"] + [f"- {_scalar(v)}" for v in value]
            parts.append("\n".join(block))

        elif value not in (None, ""):
            parts.append(f"## {section_label}\n{_scalar(value)}")

    return {
        "markdown": "\n\n".join(parts),
        "metadata": {"source": path.name, "file_type": "json"},
    }


# Mapping des extensions vers les fonctions d'extraction
EXTRACTORS = {
    # Documents textuels et techniques
    ".pdf": pdf_extractor.extract_pdf,
    ".docx": text_extractor.extract_docx,
    ".txt": extract_txt,

    # Données structurées converties en texte
    ".json": extract_json,          # ← nouvelle ligne

    # Images (Vision OCR)
    ".jpg": extract_text_from_image,
    ".jpeg": extract_text_from_image,
    ".png": extract_text_from_image,
    ".webp": extract_text_from_image
}

def process_file(file_path: str, metadata: dict = None) -> dict:
    """
    Extraction -> Nettoyage -> Chunking -> Indexation
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext not in EXTRACTORS:
        logger.warning(f"Format non supporté ignoré : {ext} ({path.name})")
        return None

    logger.info(f" Traitement en cours : {path.name}")

    try:
        # 1. PHASE D'EXTRACTION
        raw_result = EXTRACTORS[ext](file_path)
        
        # --- SÉCURITÉ ANTI-VIDE (Fix pour Groq 400) ---
        if not raw_result or "Erreur" in str(raw_result)[:20]:
            logger.error(f" Abandon de l'indexation pour {path.name} : L'extracteur a échoué.")
            return None

        # 2. NORMALISATION DU RÉSULTAT ET DES MÉTADONNÉES
        if isinstance(raw_result, str):
            markdown_content = raw_result
            file_metadata = {
                "filename": path.name,
                "source": path.name,
                "extension": ext,
                "content_type": "image"
            }
        else:
            markdown_content = raw_result.get("markdown", "")
            file_metadata = raw_result.get("metadata", {})
            file_metadata["filename"] = path.name
            if "source" not in file_metadata:
                file_metadata["source"] = path.name
            
            if "content_type" not in file_metadata:
                file_metadata["content_type"] = "text"
        if metadata:
            file_metadata.update(metadata)

        markdown_content = clean_markdown(markdown_content)
        
        # Aperçu pour le debug
        print(f"\n--- APERÇU DU CONTENU EXTRAIT ({ext}) ---")
        print(markdown_content[:500] + ("..." if len(markdown_content) > 500 else ""))
        print("--- FIN DE L'APERÇU ---\n")

        chunks = create_chunks(markdown_content, file_metadata)
        
       
        chunks_to_send = []
        for c in chunks:
            c.metadata["source"] = c.metadata.get("source", path.name)
            chunks_to_send.append({"text": c.page_content, "metadata": c.metadata})
    
        if not chunks_to_send:
            logger.warning(f" Aucun chunk généré pour {path.name}")
            return None

        # Réingestion propre : on supprime d'abord les anciens chunks de ce fichier
        # pour ne pas garder d'informations périmées quand le CV ou le JSON change.
        delete_by_filename(path.name)

        logger.info(f" Envoi de {len(chunks_to_send)} chunks vers ChromaDB ")
        indexed_count = index_chunks(chunks_to_send)

        return {
            "markdown": markdown_content,
            "metadata": file_metadata,
            "chunks_indexed": indexed_count,
            "filename": path.name,
            "status": "success"
        }

    except Exception as e:
        logger.error(f" Erreur critique lors du traitement de {path.name} : {e}")
        return None

def clean_markdown(text: str) -> str:
    """Nettoie le texte extrait pour optimiser l'indexation RAG."""
    if not text:
        return ""
    
    # Remplacer les caractères spéciaux de puces
    text = text.replace("", "-").replace("•", "-")
    
    # Normalisation des espaces
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Limitation des sauts de ligne consécutifs
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()
