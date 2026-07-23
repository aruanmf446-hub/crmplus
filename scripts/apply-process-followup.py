from pathlib import Path

path = Path("components/workspaces/phase-four/HerculesApp.tsx")
text = path.read_text(encoding="utf-8")
old_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation: string; evidence: string[] };'
new_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation?: string; evidence: string[] };'
old_guard = 'if (next === "Encerrado" && !deviation.validation.trim())'
new_guard = 'if (next === "Encerrado" && !(deviation.validation ?? "").trim())'
if old_type not in text or old_guard not in text:
    raise RuntimeError("Trechos de compatibilidade do Hércules não encontrados")
text = text.replace(old_type, new_type, 1).replace(old_guard, new_guard, 1)
path.write_text(text, encoding="utf-8")
print("Compatibilidade de desvios antigos aplicada.")
