from pathlib import Path

changes = 0

hercules = Path("components/workspaces/phase-four/HerculesApp.tsx")
text = hercules.read_text(encoding="utf-8")
old_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation: string; evidence: string[] };'
new_type = 'type Deviation = { id: string; inspectionId: string; itemId: string; description: string; priority: "Alta" | "Média" | "Baixa"; responsible: string; due: string; status: DeviationStatus; action: string; validation?: string; evidence: string[] };'
old_guard = 'if (next === "Encerrado" && !deviation.validation.trim())'
new_guard = 'if (next === "Encerrado" && !(deviation.validation ?? "").trim())'
if old_type in text:
    text = text.replace(old_type, new_type, 1)
    changes += 1
if old_guard in text:
    text = text.replace(old_guard, new_guard, 1)
    changes += 1
hercules.write_text(text, encoding="utf-8")

vertical = Path("components/workspaces/phase-four/VerticalBusinessApp.tsx")
text = vertical.read_text(encoding="utf-8")
old_transition = '''    if (isFinalRecord(selected)) return [];
    const configured = config.transitions?.[selected.status];
    if (configured) return configured.filter((status) => config.statuses.includes(status));
'''
new_transition = '''    const configured = config.transitions?.[selected.status];
    if (configured) return configured.filter((status) => config.statuses.includes(status));
    if (isFinalRecord(selected)) return [];
'''
if old_transition in text:
    text = text.replace(old_transition, new_transition, 1)
    changes += 1
elif new_transition not in text:
    raise RuntimeError("Fluxo de reativação vertical não reconhecido")
vertical.write_text(text, encoding="utf-8")

print(f"Correções complementares aplicadas: {changes}.")
