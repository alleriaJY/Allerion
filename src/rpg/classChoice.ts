import type { Player } from "../db.ts";
import { CLASS_LEVEL, classes, PROMOTION_COST, PROMOTION_LEVEL, promotionsFor, type ClassDef } from "./classes.ts";
import { levelOf } from "./player.ts";

export type ClassChoice = { ok: true; options: ClassDef[]; cost: number } | { ok: false; reason: string };

/** Which classes this player can switch to right now, and what it costs. */
export function classChoice(player: Player): ClassChoice {
  const level = levelOf(player);
  if (!player.classId) {
    if (level < CLASS_LEVEL) return { ok: false, reason: `Reach level ${CLASS_LEVEL} to pick a class. You're level ${level}.` };
    return { ok: true, options: Object.values(classes).filter((c) => c.tier === 1), cost: 0 };
  }
  const current = classes[player.classId];
  if (current.tier === 2) return { ok: false, reason: "You've mastered your class. Higher tiers are coming in a future update." };
  if (level < PROMOTION_LEVEL) {
    return { ok: false, reason: `Reach level ${PROMOTION_LEVEL} to promote your class. You're level ${level}.` };
  }
  if (player.gold < PROMOTION_COST) {
    return { ok: false, reason: `Promotion costs ${PROMOTION_COST} gold. You have ${player.gold}.` };
  }
  return { ok: true, options: promotionsFor(current.id), cost: PROMOTION_COST };
}
