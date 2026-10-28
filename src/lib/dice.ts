import { between } from "./random.ts";

export interface DiceSpec {
  count: number;
  sides: number;
  modifier: number;
}

export const MAX_DICE = 100;
export const MAX_SIDES = 1000;

/**
 * Parses dice notation such as "d20", "2d6", "3d8+2" or "4d6-1".
 * A bare number like "100" means one die with that many sides.
 * Returns an error message string when the input is invalid.
 */
export function parseDice(input: string): DiceSpec | string {
  const text = input.replace(/\s+/g, "").toLowerCase();
  const bare = /^\d+$/.exec(text);
  const match = bare ? [text, "1", text, undefined] : /^(\d*)d(\d+)([+-]\d+)?$/.exec(text);
  if (!match) return `"${input}" isn't dice notation. Try \`d20\`, \`2d6\` or \`3d8+2\`.`;

  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;

  if (count < 1 || count > MAX_DICE) return `You can roll between 1 and ${MAX_DICE} dice.`;
  if (sides < 2 || sides > MAX_SIDES) return `Dice need between 2 and ${MAX_SIDES} sides.`;
  return { count, sides, modifier };
}

export function rollDice(spec: DiceSpec, rng: (min: number, max: number) => number = between) {
  const rolls = Array.from({ length: spec.count }, () => rng(1, spec.sides));
  const total = rolls.reduce((sum, r) => sum + r, 0) + spec.modifier;
  return { rolls, total };
}
