/** Agafa un element per id i falla de seguida si no hi és: un id mal escrit no pot passar en silenci. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Falta l'element #${id}.`);
  return el as T;
}

export function all<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}
