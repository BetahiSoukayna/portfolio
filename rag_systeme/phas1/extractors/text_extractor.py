from docx import Document
from pathlib import Path

def extract_docx(file_path: str) -> dict:
    path = Path(file_path)
    doc = Document(file_path)
    markdown = f"# {path.stem}\n\n"

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        style_name = ""
        if para.style is not None and para.style.name is not None:
            style_name = para.style.name.lower()

        if "heading" in style_name:
            level = style_name.split()[-1]
            prefix = "#" * (int(level) if level.isdigit() else 1)
            markdown += f"{prefix} {text}\n\n"
        else:
            markdown += f"{text}\n\n"

    return {
        "markdown": markdown,
        "metadata": {"source": str(path), "file_type": "docx"}
    }