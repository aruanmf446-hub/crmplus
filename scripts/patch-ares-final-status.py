from pathlib import Path

path = Path("components/workspaces/phase-four/AresApp.tsx")
text = path.read_text(encoding="utf-8")
old = 'const finalQuoteStatuses: QuoteStatus[] = ["Alteração solicitada", "Aprovado", "Recusado", "Expirado"];'
new = 'const finalQuoteStatuses: QuoteStatus[] = ["Aprovado", "Recusado", "Expirado"];'
if old not in text:
    raise RuntimeError("Lista de situações finais do Ares não encontrada")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
