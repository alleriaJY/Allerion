import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { database } from "../db.ts";
import { serverOnly } from "../lib/install.ts";
import { levelOf, titleOf } from "../rpg/player.ts";
import type { SlashCommand } from "./types.ts";

const medals = ["🥇", "🥈", "🥉"];

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("The top adventurers in this server.")
    .setIntegrationTypes(serverOnly.integrationTypes)
    .setContexts(serverOnly.contexts),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const top = database().topPlayers(interaction.guildId, 10);
    const lines = top.map(
      (p, i) => `${medals[i] ?? `**${i + 1}.**`} <@${p.userId}> · Lv ${levelOf(p)} ${titleOf(p)} · ${p.xp} XP`,
    );
    const embed = new EmbedBuilder()
      .setTitle(`🏆 ${interaction.guild?.name ?? "Server"} leaderboard`)
      .setDescription(lines.join("\n") || "Nobody has any XP yet. Start chatting!")
      .setColor(0xffd700);
    await interaction.reply({ embeds: [embed] });
  },
} satisfies SlashCommand;
