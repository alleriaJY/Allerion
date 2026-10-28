import { classes, classlessBase, type ClassId, type Perks, type Stats } from "./classes.ts";

export interface Fighter extends Stats {
  name: string;
  perks: Perks;
}

export interface FightResult {
  won: boolean;
  log: string[];
  hpLeft: number;
  maxHp: number;
}

const BASE_CRIT_CHANCE = 0.05;
const BASE_CRIT_MULTIPLIER = 1.75;
const MAX_TURNS = 40;

export function playerStats(level: number, classId: ClassId | null): Stats {
  const base = classId ? classes[classId].base : classlessBase;
  return {
    hp: base.hp + 12 * (level - 1),
    atk: base.atk + 2 * (level - 1),
    def: base.def + (level - 1),
  };
}

function hit(attacker: Fighter, defender: Fighter, rng: () => number) {
  const raw = Math.max(1, attacker.atk * (attacker.perks.damage ?? 1) - defender.def * 0.5);
  const crit = rng() < (attacker.perks.critChance ?? BASE_CRIT_CHANCE);
  const damage = Math.max(1, Math.round(raw * (0.85 + 0.3 * rng()) * (crit ? attacker.perks.critMultiplier ?? BASE_CRIT_MULTIPLIER : 1)));
  return { damage, crit };
}

/** Auto-battle: the player swings first, then turns alternate until someone drops. */
export function fight(player: Fighter, monster: Fighter, rng: () => number = Math.random): FightResult {
  const log: string[] = [];
  let playerHp = player.hp;
  let monsterHp = monster.hp;
  let canRevive = (player.perks.revive ?? 0) > 0;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const p = hit(player, monster, rng);
    monsterHp -= p.damage;
    let line = `${p.crit ? "💥 **Critical!** " : ""}You hit ${monster.name} for **${p.damage}**`;
    const heal = Math.min(player.hp - playerHp, Math.round(p.damage * (player.perks.lifesteal ?? 0)));
    if (heal > 0) {
      playerHp += heal;
      line += ` and drain ${heal} HP`;
    }
    log.push(`${line}.`);
    if (monsterHp <= 0) {
      log.push(`🏆 ${monster.name} is defeated!`);
      return { won: true, log, hpLeft: playerHp, maxHp: player.hp };
    }

    const m = hit(monster, player, rng);
    playerHp -= m.damage;
    log.push(`${m.crit ? "💥 **Critical!** " : ""}${monster.name} hits you for **${m.damage}**.`);
    if (playerHp <= 0 && canRevive) {
      canRevive = false;
      playerHp = Math.round(player.hp * player.perks.revive!);
      log.push(`☠️ You rise again with ${playerHp} HP!`);
    }
    if (playerHp <= 0) {
      log.push(`🪦 You were defeated by ${monster.name}.`);
      return { won: false, log, hpLeft: 0, maxHp: player.hp };
    }
  }

  log.push(`${monster.name} slinks away before either of you falls.`);
  return { won: false, log, hpLeft: playerHp, maxHp: player.hp };
}

/** Keeps long fights readable: the opening blows, then the finish. */
export function summarizeLog(log: string[], max = 8): string[] {
  if (log.length <= max) return log;
  return [...log.slice(0, 3), "⋯", ...log.slice(-(max - 4))];
}
