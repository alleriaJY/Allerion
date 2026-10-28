/** XP needed to go from `level` to `level + 1`. Levels start at 1. */
export function xpToNext(level: number): number {
  const n = level - 1;
  return 5 * n * n + 50 * n + 100;
}

/** Level and progress from total lifetime XP. */
export function levelFromXp(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level++;
  }
  return { level, into: remaining, needed: xpToNext(level) };
}

export function progressBar(into: number, needed: number, width = 12): string {
  const filled = Math.min(width, Math.floor((into / needed) * width));
  return "▰".repeat(filled) + "▱".repeat(width - filled);
}
