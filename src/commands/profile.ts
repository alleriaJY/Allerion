import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { database } from "../db.ts";
import { serverOnly } from "../lib/install.ts";
import { classes } from "../rpg/classes.ts";
import { playerStats } from "../rpg/combat.ts";
import { levelFromXp, progressBar } from "../rpg/levels.ts";
import { titleOf } from "../rpg/player.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your adventurer's level, class and stats.")
    .addUserOption((o) => o.setName("user").setDescription("Whose profile (default: yours)"))
    .setIntegrationTypes(serverOnly.integrationTypes)
    .setContexts(serverOnly.contexts),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const user = interaction.options.getUser("user") ?? interaction.user;
    const player = database().getPlayer(interaction.guildId, user.id);
    const { level, into, needed } = levelFromXp(player.xp);
    const stats = playerStats(level, player.classId);

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
      .setTitle(`Level ${level} · ${titleOf(player)}`)
      .setDescription(`${progressBar(into, needed)} ${into} / ${needed} XP`)
      .addFields(
        { name: "Gold", value: `🪙 ${player.gold}`, inline: true },
        { name: "Adventures", value: `${player.wins} won · ${player.losses} lost`, inline: true },
        { name: "Daily streak", value: `🔥 ${player.dailyStreak}`, inline: true },
        { name: "Stats", value: `❤️ ${stats.hp} HP · ⚔️ ${stats.atk} ATK · 🛡️ ${stats.def} DEF` },
      )
      .setColor(0xdaa520);
    if (player.classId) embed.addFields({ name: "Class perk", value: classes[player.classId].blurb });
    await interaction.reply({ embeds: [embed] });
  },
} satisfies SlashCommand;
