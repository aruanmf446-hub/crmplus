from pathlib import Path

path = Path("scripts/patch-vertical-list-navigation.py")
text = path.read_text(encoding="utf-8")
old = '''def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Trecho não encontrado: {label}")
    return text.replace(old, new, 1)
'''
new = '''def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        print(f"AVISO: trecho não encontrado: {label}")
        return text
    print(f"OK: {label}")
    return text.replace(old, new, 1)
'''
if old in text:
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
else:
    print("Patch vertical já está em modo tolerante ou possui outra formatação.")
