import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { database } from "../db.ts";
import { serverOnly } from "../lib/install.ts";
import { formatDuration } from "../lib/time.ts";
import { levelUpLine } from "../rpg/announce.ts";
import { fight, playerStats, summarizeLog } from "../rpg/combat.ts";
import { monsterStats, pickMonster } from "../rpg/monsters.ts";
import { grant, levelOf, perksOf } from "../rpg/player.ts";
import { ADVENTURE_COOLDOWN_MS, adventureReward } from "../rpg/rewards.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("adventure")
    .setDescription("Head out and fight a monster for XP and gold.")
    .setIntegrationTypes(serverOnly.integrationTypes)
    .setContexts(serverOnly.contexts),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const store = database();
    const player = store.getPlayer(interaction.guildId, interaction.user.id);
    const now = Date.now();
    const wait = player.lastAdventureAt + ADVENTURE_COOLDOWN_MS - now;
    if (wait > 0) {
      return interaction.reply({ content: `You're still resting. Adventure again in **${formatDuration(wait)}**.`, flags: MessageFlags.Ephemeral });
    }

    const level = levelOf(player);
    const perks = perksOf(player);
    const monster = pickMonster(level);
    const result = fight(
      { name: interaction.user.displayName, ...playerStats(level, player.classId), perks },
      { name: monster.name, ...monsterStats(monster, level), perks: {} },
    );

    const reward = adventureReward(level, result.won, perks);
    player.lastAdventureAt = now;
    if (result.won) player.wins++;
    else player.losses++;
    const newLevel = grant(player, reward);
    store.savePlayer(player);

    const rewardText = reward.gold > 0 ? `+${reward.xp} XP · +${reward.gold} 🪙` : `+${reward.xp} XP (you learned something, at least)`;
    const embed = new EmbedBuilder()
      .setTitle(`${monster.emoji} A wild ${monster.name} appears!`)
      .setDescription(summarizeLog(result.log).join("\n"))
      .addFields(
        { name: result.won ? "Victory" : "Defeat", value: `❤️ ${result.hpLeft} / ${result.maxHp} HP left`, inline: true },
        { name: "Rewards", value: rewardText, inline: true },
      )
      .setColor(result.won ? 0x32cd32 : 0xb22222);
    await interaction.reply({
      content: newLevel ? levelUpLine(player, newLevel) : undefined,
      embeds: [embed],
      allowedMentions: { users: [] },
    });
  },
} satisfies SlashCommand;
