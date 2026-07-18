// Remplace les {placeholder} à accolade simple, sans toucher aux {{variable}}
// à double accolade utilisées comme exemples de syntaxe de template email.
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_match, key: string) => String(vars[key] ?? ""));
}
