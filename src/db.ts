import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { isClassId, type ClassId } from "./rpg/classes.ts";

export interface Player {
  guildId: string;
  userId: string;
  xp: number;
  gold: number;
  classId: ClassId | null;
  wins: number;
  losses: number;
  lastChatAt: number;
  lastAdventureAt: number;
  lastDaily: string | null;
  dailyStreak: number;
}

interface Row {
  guild_id: string;
  user_id: string;
  xp: number;
  gold: number;
  class_id: string | null;
  wins: number;
  losses: number;
  last_chat_at: number;
  last_adventure_at: number;
  last_daily: string | null;
  daily_streak: number;
}

// Each entry runs once, in order. Only ever append to this list.
const migrations = [
  `CREATE TABLE players (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 0,
    class_id TEXT,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    last_chat_at INTEGER NOT NULL DEFAULT 0,
    last_adventure_at INTEGER NOT NULL DEFAULT 0,
    last_daily TEXT,
    daily_streak INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  )`,
];

function fromRow(row: Row): Player {
  return {
    guildId: row.guild_id,
    userId: row.user_id,
    xp: row.xp,
    gold: row.gold,
    classId: row.class_id && isClassId(row.class_id) ? row.class_id : null,
    wins: row.wins,
    losses: row.losses,
    lastChatAt: row.last_chat_at,
    lastAdventureAt: row.last_adventure_at,
    lastDaily: row.last_daily,
    dailyStreak: row.daily_streak,
  };
}

export function openDatabase(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");

  const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
  for (const [i, sql] of migrations.entries()) {
    if (i < version) continue;
    db.exec("BEGIN");
    db.exec(sql);
    db.exec(`PRAGMA user_version = ${i + 1}`);
    db.exec("COMMIT");
  }

  const select = db.prepare("SELECT * FROM players WHERE guild_id = ? AND user_id = ?");
  const upsert = db.prepare(`
    INSERT INTO players (guild_id, user_id, xp, gold, class_id, wins, losses, last_chat_at, last_adventure_at, last_daily, daily_streak)
    VALUES (:guildId, :userId, :xp, :gold, :classId, :wins, :losses, :lastChatAt, :lastAdventureAt, :lastDaily, :dailyStreak)
    ON CONFLICT (guild_id, user_id) DO UPDATE SET
      xp = :xp, gold = :gold, class_id = :classId, wins = :wins, losses = :losses, last_chat_at = :lastChatAt,
      last_adventure_at = :lastAdventureAt, last_daily = :lastDaily, daily_streak = :dailyStreak`);
  const top = db.prepare("SELECT * FROM players WHERE guild_id = ? ORDER BY xp DESC LIMIT ?");

  return {
    /** The stored player, or a fresh one (not saved until `savePlayer`). */
    getPlayer(guildId: string, userId: string): Player {
      const row = select.get(guildId, userId) as Row | undefined;
      if (row) return fromRow(row);
      return {
        guildId, userId, xp: 0, gold: 0, classId: null, wins: 0, losses: 0,
        lastChatAt: 0, lastAdventureAt: 0, lastDaily: null, dailyStreak: 0,
      };
    },
    savePlayer(player: Player) {
      upsert.run({ ...player });
    },
    topPlayers(guildId: string, limit: number): Player[] {
      return (top.all(guildId, limit) as unknown as Row[]).map(fromRow);
    },
    close() {
      db.close();
    },
  };
}

export type Database = ReturnType<typeof openDatabase>;

let shared: Database | undefined;

/** The bot's database, opened on first use. */
export function database(): Database {
  return (shared ??= openDatabase(process.env.DATABASE_PATH || "data/allerion.sqlite"));
}
