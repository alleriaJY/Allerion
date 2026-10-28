export interface Stats {
  hp: number;
  atk: number;
  def: number;
}

/** Multipliers and combat perks. Anything left out means "no bonus". */
export interface Perks {
  xp?: number;
  gold?: number;
  daily?: number;
  damage?: number;
  critChance?: number;
  critMultiplier?: number;
  /** Fraction of damage dealt that heals you. */
  lifesteal?: number;
  /** Once per fight, get back up with this fraction of max HP. */
  revive?: number;
}

export interface ClassDef {
  id: ClassId;
  name: string;
  emoji: string;
  tier: 1 | 2;
  parent?: ClassId;
  blurb: string;
  base: Stats;
  perks: Perks;
}

export const CLASS_LEVEL = 5;
export const PROMOTION_LEVEL = 20;
export const PROMOTION_COST = 1000;

/** Stats for players who haven't picked a class yet. */
export const classlessBase: Stats = { hp: 90, atk: 10, def: 5 };

const defs = [
  // Tier 1, free at level 5. Same three as the original bot.
  { id: "goblin", name: "Goblin", emoji: "👺", tier: 1, blurb: "Quick and greedy. +25% gold, more critical hits.",
    base: { hp: 90, atk: 12, def: 4 }, perks: { gold: 1.25, critChance: 0.12 } },
  { id: "human", name: "Human", emoji: "🧑", tier: 1, blurb: "Balanced and quick to learn. +15% XP.",
    base: { hp: 100, atk: 11, def: 6 }, perks: { xp: 1.15 } },
  { id: "undead", name: "Undead", emoji: "💀", tier: 1, blurb: "Hard to put down. +50% daily rewards, tougher hide.",
    base: { hp: 115, atk: 10, def: 7 }, perks: { daily: 1.5 } },

  // Tier 2, promotions at level 20. Reworked from the original ranks list.
  { id: "imp", name: "Gambling Imp", emoji: "🎲", tier: 2, parent: "goblin", blurb: "Lives for the big hit. Crits are frequent and hit 2.25×.",
    base: { hp: 95, atk: 13, def: 4 }, perks: { gold: 1.25, critChance: 0.2, critMultiplier: 2.25 } },
  { id: "greevil", name: "Alchemy Greevil", emoji: "⚗️", tier: 2, parent: "goblin", blurb: "Turns everything into gold. +75% gold.",
    base: { hp: 105, atk: 13, def: 6 }, perks: { gold: 1.75, critChance: 0.12 } },
  { id: "wizard", name: "The Wizard", emoji: "🧙", tier: 2, parent: "human", blurb: "Raw arcane power. +20% damage, +15% XP.",
    base: { hp: 95, atk: 12, def: 5 }, perks: { xp: 1.15, damage: 1.2 } },
  { id: "troop", name: "The Golden Troop", emoji: "🛡️", tier: 2, parent: "human", blurb: "Disciplined veterans. +40% XP and gold.",
    base: { hp: 115, atk: 12, def: 8 }, perks: { xp: 1.4, gold: 1.4 } },
  { id: "soulhunter", name: "The Soul Hunter", emoji: "🗡️", tier: 2, parent: "undead", blurb: "Feeds on its prey. Heals 15% of damage dealt.",
    base: { hp: 115, atk: 11, def: 7 }, perks: { daily: 1.5, lifesteal: 0.15 } },
  { id: "lich", name: "The Lich", emoji: "☠️", tier: 2, parent: "undead", blurb: "Death is a setback. Rises once per fight. +50% daily rewards.",
    base: { hp: 105, atk: 11, def: 6 }, perks: { daily: 1.5, revive: 0.2 } },
] as const satisfies readonly (Omit<ClassDef, "id" | "parent"> & { id: string; parent?: string })[];

export type ClassId = (typeof defs)[number]["id"];

export const classes: Record<ClassId, ClassDef> = Object.fromEntries(defs.map((d) => [d.id, d])) as Record<ClassId, ClassDef>;

export function isClassId(value: string): value is ClassId {
  return Object.hasOwn(classes, value);
}

export function promotionsFor(id: ClassId): ClassDef[] {
  return Object.values(classes).filter((c) => c.parent === id);
}

/** Title shown before a class is picked, a nod to the original ranks. */
export function classlessTitle(level: number): string {
  if (level < 3) return "Beginner";
  if (level < CLASS_LEVEL) return "Apprentice";
  return "Jobless";
}
