import type { Player } from "../db.ts";
import { classes, classlessTitle, type Perks } from "./classes.ts";
import { levelFromXp } from "./levels.ts";

export function levelOf(player: Player): number {
  return levelFromXp(player.xp).level;
}

export function perksOf(player: Player): Perks {
  return player.classId ? classes[player.classId].perks : {};
}

export function titleOf(player: Player): string {
  if (!player.classId) return classlessTitle(levelOf(player));
  const c = classes[player.classId];
  return `${c.emoji} ${c.name}`;
}

/** Adds XP and gold. Returns the new level if the player levelled up, else null. */
export function grant(player: Player, reward: { xp: number; gold: number }): number | null {
  const before = levelOf(player);
  player.xp += reward.xp;
  player.gold += reward.gold;
  const after = levelOf(player);
  return after > before ? after : null;
}
