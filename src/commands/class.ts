import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { database } from "../db.ts";
import { serverOnly } from "../lib/install.ts";
import { classChoice } from "../rpg/classChoice.ts";
import { CLASS_LEVEL, classes, PROMOTION_COST, PROMOTION_LEVEL, promotionsFor } from "../rpg/classes.ts";
import { titleOf } from "../rpg/player.ts";
import type { SlashCommand } from "./types.ts";

function classTree(): string {
  return Object.values(classes)
    .filter((c) => c.tier === 1)
    .map((c) => {
      const promos = promotionsFor(c.id).map((p) => `　↳ ${p.emoji} **${p.name}**: ${p.blurb}`);
      return [`${c.emoji} **${c.name}**: ${c.blurb}`, ...promos].join("\n");
    })
    .join("\n\n");
}

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("class")
    .setDescription("See the classes, and pick or promote yours.")
    .setIntegrationTypes(serverOnly.integrationTypes)
    .setContexts(serverOnly.contexts),
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    const { guildId, user } = interaction;
    const store = database();
    const player = store.getPlayer(guildId, user.id);
    const choice = classChoice(player);

    const embed = new EmbedBuilder()
      .setTitle(`Your class: ${titleOf(player)}`)
      .setDescription(classTree())
      .setFooter({ text: `Pick a class at level ${CLASS_LEVEL}. Promote at level ${PROMOTION_LEVEL} for ${PROMOTION_COST} gold.` })
      .setColor(0xff8c00);
    if (!choice.ok) {
      embed.addFields({ name: "Next step", value: choice.reason });
      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("class:pick")
      .setPlaceholder(choice.cost > 0 ? `Promote for ${choice.cost} gold…` : "Choose your class…")
      .addOptions(choice.options.map((c) => ({ label: c.name, value: c.id, emoji: c.emoji, description: c.blurb.slice(0, 100) })));
    const response = await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)],
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    const selection = await response.resource?.message
      ?.awaitMessageComponent({ componentType: ComponentType.StringSelect, time: 60_000 })
      .catch(() => null);
    if (!selection) {
      return interaction.editReply({ content: "No class picked. Run `/class` again when you're ready.", components: [] });
    }

    // Re-check against fresh data: gold or class may have changed while the menu was open.
    const fresh = store.getPlayer(guildId, user.id);
    const now = classChoice(fresh);
    const picked = now.ok ? now.options.find((c) => c.id === selection.values[0]) : undefined;
    if (!now.ok || !picked) {
      return selection.update({ content: now.ok ? "That class isn't available." : now.reason, embeds: [], components: [] });
    }

    fresh.classId = picked.id;
    fresh.gold -= now.cost;
    store.savePlayer(fresh);
    await selection.update({ content: `You are now ${picked.emoji} **${picked.name}**!`, embeds: [], components: [] });
    await interaction.followUp({
      content: `${picked.emoji} <@${user.id}> has become **${picked.name}**! ${picked.blurb}`,
      allowedMentions: { users: [] },
    });
  },
} satisfies SlashCommand;
