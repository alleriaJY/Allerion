import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { database } from "../db.ts";
import { serverOnly } from "../lib/install.ts";
import { formatDuration, msUntilNextUtcDay } from "../lib/time.ts";
import { perksOf } from "../rpg/player.ts";
import { dailyReward, MAX_STREAK_BONUS_DAYS, nextStreak, utcDay } from "../rpg/rewards.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily gold. Come back every day to build a streak.")
    .setIntegrationTypes(serverOnly.integrationTypes)
    .setContexts(serverOnly.contexts),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const store = database();
    const player = store.getPlayer(interaction.guildId, interaction.user.id);
    const now = new Date();
    const today = utcDay(now);
    const streak = nextStreak(player.lastDaily, player.dailyStreak, today);
    if (streak === null) {
      return interaction.reply({
        content: `You've already claimed today's gold. Next daily in **${formatDuration(msUntilNextUtcDay(now))}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const gold = dailyReward(streak, perksOf(player));
    player.gold += gold;
    player.lastDaily = today;
    player.dailyStreak = streak;
    store.savePlayer(player);

    const streakText = streak > 1 ? ` 🔥 ${streak}-day streak${streak >= MAX_STREAK_BONUS_DAYS ? " (max bonus)" : ""}!` : "";
    await interaction.reply(`🪙 You claimed **${gold} gold**.${streakText} You now have ${player.gold}.`);
  },
} satisfies SlashCommand;
