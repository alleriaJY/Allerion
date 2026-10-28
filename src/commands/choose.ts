import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { splitChoices } from "../lib/choices.ts";
import { everywhere } from "../lib/install.ts";
import { pick } from "../lib/random.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Can't decide? Let Allerion pick for you.")
    .addStringOption((o) =>
      o.setName("options").setDescription("Separate with commas, e.g. pizza, sushi, tacos").setRequired(true),
    )
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const options = splitChoices(interaction.options.getString("options", true));
    if (options.length < 2) {
      return interaction.reply({ content: "Give me at least two options to choose from.", flags: MessageFlags.Ephemeral });
    }
    await interaction.reply(`Out of ${options.map((o) => `**${o}**`).join(", ")}, I choose… **${pick(options)}**!`);
  },
} satisfies SlashCommand;
