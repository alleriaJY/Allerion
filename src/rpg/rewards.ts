import type { Perks } from "./classes.ts";

export const CHAT_COOLDOWN_MS = 60_000;
export const ADVENTURE_COOLDOWN_MS = 10 * 60_000;
export const MAX_STREAK_BONUS_DAYS = 7;

function randInt(min: number, max: number, rng: () => number) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function chatReward(perks: Perks, rng: () => number = Math.random) {
  return {
    xp: Math.round(randInt(15, 25, rng) * (perks.xp ?? 1)),
    gold: Math.round(randInt(2, 5, rng) * (perks.gold ?? 1)),
  };
}

export function adventureReward(level: number, won: boolean, perks: Perks) {
  const xp = won ? 40 + 8 * level : 10 + 2 * level;
  const gold = won ? 15 + 4 * level : 0;
  return { xp: Math.round(xp * (perks.xp ?? 1)), gold: Math.round(gold * (perks.gold ?? 1)) };
}

export function dailyReward(streak: number, perks: Perks) {
  const bonusDays = Math.min(streak, MAX_STREAK_BONUS_DAYS) - 1;
  return Math.round((100 + 15 * bonusDays) * (perks.daily ?? 1) * (perks.gold ?? 1));
}

/** UTC calendar day, e.g. "2026-10-28". Dailies reset at 00:00 UTC. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The streak after claiming today, or null if today was already claimed. */
export function nextStreak(lastDaily: string | null, streak: number, today: string): number | null {
  if (lastDaily === today) return null;
  const yesterday = utcDay(new Date(Date.parse(today) - 86_400_000));
  return lastDaily === yesterday ? streak + 1 : 1;
}
