import { ApplicationCommandType, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { everywhere } from "../lib/install.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List everything Allerion can do.")
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    // Read the registered commands back from Discord so the list (and the clickable
    // command mentions) always match what users actually see.
    let registered = await interaction.client.application.commands.fetch();
    if (registered.size === 0 && interaction.guild) {
      registered = await interaction.guild.commands.fetch();
    }

    const slash = registered
      .filter((c) => c.type === ApplicationCommandType.ChatInput)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `</${c.name}:${c.id}> ${c.description}`);
    const menus = registered
      .filter((c) => c.type !== ApplicationCommandType.ChatInput)
      .map((c) => `**${c.name}** (right-click a ${c.type === ApplicationCommandType.User ? "user" : "message"} → Apps)`);

    const embed = new EmbedBuilder()
      .setTitle("Allerion")
      .setDescription(slash.join("\n") || "No commands are registered yet. Run `npm run deploy`.")
      .setColor(0xb200ff)
      .setThumbnail(interaction.client.user.displayAvatarURL());
    if (menus.length > 0) embed.addFields({ name: "Right-click menus", value: menus.join("\n") });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
} satisfies SlashCommand;
