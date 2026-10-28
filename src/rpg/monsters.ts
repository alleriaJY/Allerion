import type { Stats } from "./classes.ts";

export interface MonsterDef {
  name: string;
  emoji: string;
  minLevel: number;
  /** Multiplier on the level-scaled baseline. */
  power: number;
}

export const monsters: MonsterDef[] = [
  { name: "Slime", emoji: "🟢", minLevel: 1, power: 0.7 },
  { name: "Cave Rat", emoji: "🐀", minLevel: 1, power: 0.8 },
  { name: "Wolf", emoji: "🐺", minLevel: 3, power: 0.9 },
  { name: "Bandit", emoji: "🥷", minLevel: 5, power: 1.0 },
  { name: "Skeleton", emoji: "🦴", minLevel: 8, power: 1.0 },
  { name: "Orc Brute", emoji: "👹", minLevel: 12, power: 1.05 },
  { name: "Troll", emoji: "🧌", minLevel: 18, power: 1.1 },
  { name: "Wraith", emoji: "👻", minLevel: 25, power: 1.15 },
  { name: "Dragon Whelp", emoji: "🐉", minLevel: 35, power: 1.2 },
  { name: "The Night King", emoji: "❄️", minLevel: 50, power: 1.3 },
];

/** Picks a monster the player can meet, favouring the toughest few available. */
export function pickMonster(level: number, rng: () => number = Math.random): MonsterDef {
  const available = monsters.filter((m) => m.minLevel <= level);
  const pool = available.slice(-4);
  return pool[Math.floor(rng() * pool.length)]!;
}

export function monsterStats(monster: MonsterDef, level: number): Stats {
  // Power mostly means more HP; attack only creeps up so late fights stay winnable.
  return {
    hp: Math.round((75 + 12 * (level - 1)) * monster.power),
    atk: Math.round((15 + 1.9 * (level - 1)) * (0.8 + 0.2 * monster.power)),
    def: Math.round(4 + 0.8 * (level - 1)),
  };
}
