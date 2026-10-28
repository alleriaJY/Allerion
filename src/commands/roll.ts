import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { parseDice, rollDice } from "../lib/dice.ts";
import { everywhere } from "../lib/install.ts";
import type { SlashCommand } from "./types.ts";

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll dice, e.g. d20, 2d6 or 3d8+2.")
    .addStringOption((o) => o.setName("dice").setDescription("Dice to roll (default: d6)").setMaxLength(20))
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const input = interaction.options.getString("dice") ?? "d6";
    const spec = parseDice(input);
    if (typeof spec === "string") {
      return interaction.reply({ content: spec, flags: MessageFlags.Ephemeral });
    }

    const { rolls, total } = rollDice(spec);
    const mod = spec.modifier === 0 ? "" : spec.modifier > 0 ? ` + ${spec.modifier}` : ` − ${-spec.modifier}`;
    const detail = rolls.length > 1 || mod ? `\n\`[${rolls.join(", ")}]${mod}\`` : "";
    await interaction.reply(`🎲 **${input}** → **${total}**${detail}`);
  },
} satisfies SlashCommand;
