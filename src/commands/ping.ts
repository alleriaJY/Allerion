import { SlashCommandBuilder } from "discord.js";
import { everywhere } from "../lib/install.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check that Allerion is awake.")
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const sent = Date.now();
    await interaction.reply("Pong!");
    const roundTrip = Date.now() - sent;
    await interaction.editReply(`Pong! Round trip ${roundTrip} ms, gateway ${interaction.client.ws.ping} ms.`);
  },
} satisfies SlashCommand;
