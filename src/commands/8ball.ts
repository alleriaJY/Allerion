import { SlashCommandBuilder } from "discord.js";
import { everywhere } from "../lib/install.ts";
import { pick } from "../lib/random.ts";
import type { SlashCommand } from "./types.ts";

const answers = [
  "It is certain.", "Without a doubt.", "You may rely on it.", "Yes, definitely.",
  "Most likely.", "Outlook good.", "Signs point to yes.", "Yes.",
  "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.",
  "Don't count on it.", "My reply is no.", "My sources say no.", "Very doubtful.",
];

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a yes/no question.")
    .addStringOption((o) => o.setName("question").setDescription("Your question").setRequired(true).setMaxLength(200))
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    await interaction.reply(`> ${question}\n🎱 ${pick(answers)}`);
  },
} satisfies SlashCommand;
