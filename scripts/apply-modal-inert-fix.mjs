import fs from "node:fs";

const file = "components/workspaces/phase-four/shared.tsx";
const source = fs.readFileSync(file, "utf8");

const oldSetup = `    const root = backdropRef.current?.closest("[data-product]");
    const inertElements = root ? Array.from(root.children).filter((element) => element !== backdropRef.current) as HTMLElement[] : [];
    inertElements.forEach((element) => { element.inert = true; });`;

const newSetup = `    const root = backdropRef.current?.closest<HTMLElement>("[data-product]") ?? null;
    const inertStates: Array<{ element: HTMLElement; inert: boolean }> = [];
    let activeBranch: HTMLElement | null = backdropRef.current;

    while (activeBranch?.parentElement && activeBranch !== root) {
      const parent = activeBranch.parentElement;
      for (const sibling of Array.from(parent.children)) {
        if (sibling === activeBranch || !(sibling instanceof HTMLElement)) continue;
        inertStates.push({ element: sibling, inert: sibling.inert });
        sibling.inert = true;
      }
      activeBranch = parent;
    }`;

const oldCleanup = `      inertElements.forEach((element) => { element.inert = false; });`;
const newCleanup = `      inertStates.forEach(({ element, inert }) => { element.inert = inert; });`;

if (!source.includes(oldSetup)) {
  throw new Error("Bloco esperado de ativação do fundo inerte não foi encontrado.");
}
if (!source.includes(oldCleanup)) {
  throw new Error("Bloco esperado de restauração do fundo inerte não foi encontrado.");
}

const updated = source.replace(oldSetup, newSetup).replace(oldCleanup, newCleanup);
fs.writeFileSync(file, updated, "utf8");
console.log("Isolamento acessível do modal corrigido.");
