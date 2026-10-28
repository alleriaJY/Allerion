import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import { everywhere } from "../lib/install.ts";
import type { SlashCommand, UserMenuCommand } from "./types.ts";

function avatarEmbed(user: User) {
  return new EmbedBuilder()
    .setTitle(`${user.displayName}'s avatar`)
    .setImage(user.displayAvatarURL({ size: 1024 }))
    .setColor(user.accentColor ?? 0xb200ff);
}

const slash = {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show someone's avatar in full size.")
    .addUserOption((o) => o.setName("user").setDescription("Whose avatar (default: yours)"))
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    await interaction.reply({ embeds: [avatarEmbed(user)] });
  },
} satisfies SlashCommand;

const menu = {
  kind: "user",
  data: new ContextMenuCommandBuilder()
    .setName("View avatar")
    .setType(ApplicationCommandType.User)
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    await interaction.reply({ embeds: [avatarEmbed(interaction.targetUser)] });
  },
} satisfies UserMenuCommand;

export default [slash, menu];
