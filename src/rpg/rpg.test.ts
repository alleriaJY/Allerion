import assert from "node:assert/strict";
import { test } from "node:test";
import { openDatabase } from "../db.ts";
import { classes, promotionsFor } from "./classes.ts";
import { fight, playerStats, summarizeLog } from "./combat.ts";
import { levelFromXp, xpToNext } from "./levels.ts";
import { monsterStats, monsters, pickMonster } from "./monsters.ts";
import { grant } from "./player.ts";
import { adventureReward, chatReward, dailyReward, nextStreak } from "./rewards.ts";

test("levels follow the XP curve", () => {
  assert.equal(xpToNext(1), 100);
  assert.deepEqual(levelFromXp(0), { level: 1, into: 0, needed: 100 });
  assert.deepEqual(levelFromXp(99), { level: 1, into: 99, needed: 100 });
  assert.deepEqual(levelFromXp(100), { level: 2, into: 0, needed: 155 });
  assert.equal(levelFromXp(100 + 155 + 220 + 295).level, 5);
});

test("every tier 1 class has two promotions", () => {
  for (const c of Object.values(classes).filter((c) => c.tier === 1)) {
    assert.equal(promotionsFor(c.id).length, 2, c.id);
  }
});

test("class perks change rewards", () => {
  const max = () => 0.999;
  assert.deepEqual(chatReward({}, max), { xp: 25, gold: 5 });
  assert.deepEqual(chatReward(classes.troop.perks, max), { xp: 35, gold: 7 });
  assert.deepEqual(adventureReward(10, false, {}), { xp: 30, gold: 0 });
  assert.equal(dailyReward(1, {}), 100);
  assert.equal(dailyReward(30, {}), 190);
  assert.equal(dailyReward(1, classes.undead.perks), 150);
});

test("daily streaks continue, reset, or refuse a second claim", () => {
  assert.equal(nextStreak(null, 0, "2026-10-28"), 1);
  assert.equal(nextStreak("2026-10-27", 4, "2026-10-28"), 5);
  assert.equal(nextStreak("2026-10-25", 4, "2026-10-28"), 1);
  assert.equal(nextStreak("2026-10-28", 4, "2026-10-28"), null);
  assert.equal(nextStreak("2026-12-31", 2, "2027-01-01"), 3);
});

test("fights end with a winner and the lich revives", () => {
  const monster = { name: "Dummy", hp: 10_000, atk: 500, def: 0, perks: {} };
  const lich = { name: "you", ...playerStats(20, "lich"), perks: classes.lich.perks };
  const result = fight(lich, monster, () => 0.5);
  assert.equal(result.won, false);
  assert.ok(result.log.some((l) => l.includes("rise again")));
});

test("monsters unlock with level and stats grow", () => {
  assert.ok(monsters.filter((m) => m.minLevel <= 1).length >= 2);
  for (let i = 0; i < 50; i++) assert.ok(pickMonster(4).minLevel <= 4);
  const slime = monsters[0]!;
  assert.ok(monsterStats(slime, 30).hp > monsterStats(slime, 1).hp);
});

test("summarizeLog keeps the start and the finish", () => {
  const log = Array.from({ length: 20 }, (_, i) => `line ${i}`);
  const short = summarizeLog(log);
  assert.equal(short.length, 8);
  assert.equal(short[0], "line 0");
  assert.equal(short.at(-1), "line 19");
});

test("players round-trip through the database and report level ups", () => {
  const db = openDatabase(":memory:");
  const p = db.getPlayer("g", "u");
  assert.equal(p.xp, 0);
  assert.equal(grant(p, { xp: 99, gold: 5 }), null);
  assert.equal(grant(p, { xp: 1, gold: 0 }), 2);
  p.classId = "goblin";
  p.lastDaily = "2026-10-28";
  db.savePlayer(p);
  db.savePlayer({ ...db.getPlayer("g", "v"), xp: 500 });
  assert.deepEqual(db.getPlayer("g", "u"), p);
  assert.deepEqual(db.topPlayers("g", 10).map((x) => x.userId), ["v", "u"]);
  assert.equal(db.topPlayers("other", 10).length, 0);
  db.close();
});

test("class choice unlocks at 5, promotion at 20 with gold", async () => {
  const { classChoice } = await import("./classChoice.ts");
  const db = openDatabase(":memory:");
  const p = db.getPlayer("g", "u");
  assert.equal(classChoice(p).ok, false);

  p.xp = levelXp(5);
  const pick = classChoice(p);
  assert.ok(pick.ok && pick.cost === 0 && pick.options.length === 3);

  p.classId = "human";
  assert.equal(classChoice(p).ok, false);
  p.xp = levelXp(20);
  assert.equal(classChoice(p).ok, false, "not enough gold");
  p.gold = 1000;
  const promo = classChoice(p);
  assert.ok(promo.ok && promo.cost === 1000);
  assert.deepEqual(promo.options.map((c) => c.id).sort(), ["troop", "wizard"]);

  p.classId = "wizard";
  assert.equal(classChoice(p).ok, false);
  db.close();
});

function levelXp(level: number): number {
  let xp = 0;
  for (let l = 1; l < level; l++) xp += xpToNext(l);
  return xp;
}
