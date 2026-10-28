import type { Message } from "discord.js";
import { database } from "../db.ts";
import { levelUpLine } from "../rpg/announce.ts";
import { grant, perksOf } from "../rpg/player.ts";
import { CHAT_COOLDOWN_MS, chatReward } from "../rpg/rewards.ts";

/** Chatting earns XP and a little gold, at most once a minute per server. */
export async function onMessage(message: Message) {
  if (message.author.bot || message.system || !message.inGuild()) return;

  const store = database();
  const player = store.getPlayer(message.guildId, message.author.id);
  const now = Date.now();
  if (now - player.lastChatAt < CHAT_COOLDOWN_MS) return;

  player.lastChatAt = now;
  const newLevel = grant(player, chatReward(perksOf(player)));
  store.savePlayer(player);

  if (newLevel) {
    await message.channel.send({ content: levelUpLine(player, newLevel), allowedMentions: { users: [player.userId] } }).catch(() => {});
  }
}
