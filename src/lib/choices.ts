/** Splits "pizza, sushi | tacos or burgers" into options. Falls back to spaces. */
export function splitChoices(input: string): string[] {
  const separators = /\s*(?:,|\||\bor\b)\s*/i;
  const parts = separators.test(input) ? input.split(separators) : input.split(/\s+/);
  return [...new Set(parts.map((p) => p.trim()).filter(Boolean))];
}
