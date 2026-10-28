import type { Player } from "../db.ts";
import { CLASS_LEVEL, classes, PROMOTION_COST, PROMOTION_LEVEL } from "./classes.ts";

/** One-line level-up message, with a nudge when a class choice unlocks. */
export function levelUpLine(player: Player, level: number): string {
  let line = `🎉 <@${player.userId}> reached **level ${level}**!`;
  if (level >= CLASS_LEVEL && !player.classId) {
    line += " You can now pick a class with `/class`.";
  } else if (level === PROMOTION_LEVEL && player.classId && classes[player.classId].tier === 1) {
    line += ` You can now promote your class for ${PROMOTION_COST} gold with \`/class\`.`;
  }
  return line;
}
