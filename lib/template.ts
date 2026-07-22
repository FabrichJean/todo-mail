const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariables(...sources: string[]): string[] {
  const found = new Set<string>();
  for (const source of sources) {
    for (const match of source.matchAll(VARIABLE_PATTERN)) {
      found.add(match[1]);
    }
  }
  return Array.from(found);
}

export function renderTemplate(source: string, variables: Record<string, string>): string {
  return source.replace(VARIABLE_PATTERN, (_match, key: string) => variables[key] ?? "");
}

// Convertit les retours à la ligne d'un texte brut en <br> pour un rendu HTML correct
// (les sauts de ligne seuls sont ignorés par les clients mail en HTML). Les retours à la
// ligne purement structurels entre deux balises (ex: le HTML sérialisé par l'éditeur) sont
// ignorés puisque les éléments de bloc (<p>, <li>...) espacent déjà le contenu eux-mêmes.
export function nl2br(text: string): string {
  return text.replace(/>\s*[\r\n]+\s*</g, "><").replace(/\r\n|\r|\n/g, "<br>\n");
}
