"""Post-traitement des réponses du LLM pour garantir un Markdown propre côté affichage."""
import re

_THINK = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
_LIST_ITEM = re.compile(r"\s*([-*•]|\d+[.)])\s+")
_HEADING = re.compile(r"\s*#{1,6}\s+")


def clean_answer(text: str) -> str:
    """
    - retire d'éventuels blocs <think>
    - normalise les puces (•, *) en "-"
    - ramène les titres H1/H2 en H3 (la bulle de chat ne doit pas avoir de gros titres)
    - garantit une ligne vide avant/après chaque titre et avant chaque liste
    - réduit les sauts de ligne multiples
    """
    if not text:
        return ""

    text = _THINK.sub("", text).replace("\r\n", "\n").strip()
    text = re.sub(r"^(\s*)[•*]\s+", r"\1- ", text, flags=re.MULTILINE)
    text = re.sub(r"^#{1,2}\s+", "### ", text, flags=re.MULTILINE)

    out: list[str] = []
    for line in text.split("\n"):
        is_list = bool(_LIST_ITEM.match(line))
        is_heading = bool(_HEADING.match(line))
        prev = out[-1] if out else ""

        if out and prev.strip():
            prev_is_list = bool(_LIST_ITEM.match(prev))
            prev_is_heading = bool(_HEADING.match(prev))
            if is_heading and not prev_is_heading:
                out.append("")
            elif is_list and not prev_is_list:
                out.append("")
            elif prev_is_heading and line.strip():
                out.append("")
        out.append(line)

    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
