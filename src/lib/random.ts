import { randomInt } from "node:crypto";

/** Random integer in [min, max], inclusive. */
export function between(min: number, max: number): number {
  return randomInt(min, max + 1);
}

export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick() needs at least one item");
  return items[randomInt(items.length)] as T;
}
