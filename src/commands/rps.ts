import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  SlashCommandBuilder,
  type User,
} from "discord.js";
import { everywhere } from "../lib/install.ts";
import { pick } from "../lib/random.ts";
import { isMove, judge, moves, type Move } from "../lib/rps.ts";
import type { SlashCommand } from "./types.ts";

const TIMEOUT_MS = 60_000;

function show(user: User, move: Move) {
  return `${user} ${moves[move].emoji} ${move}`;
}

export default {
  kind: "slash",
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Rock, paper, scissors against a friend or against Allerion.")
    .addUserOption((o) => o.setName("opponent").setDescription("Who to challenge (default: Allerion)"))
    .setIntegrationTypes(everywhere.integrationTypes)
    .setContexts(everywhere.contexts),
  async execute(interaction) {
    const me = interaction.client.user;
    const challenger = interaction.user;
    const opponent = interaction.options.getUser("opponent") ?? me;

    if (opponent.id === challenger.id) {
      return interaction.reply({ content: "You can't play against yourself.", flags: MessageFlags.Ephemeral });
    }
    if (opponent.bot && opponent.id !== me.id) {
      return interaction.reply({ content: "That bot doesn't know how to play. Challenge me instead!", flags: MessageFlags.Ephemeral });
    }

    const picks = new Map<string, Move>();
    if (opponent.id === me.id) picks.set(me.id, pick(Object.keys(moves) as Move[]));

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      (Object.keys(moves) as Move[]).map((move) =>
        new ButtonBuilder()
          .setCustomId(`rps:${move}`)
          .setEmoji(moves[move].emoji)
          .setLabel(move[0]!.toUpperCase() + move.slice(1))
          .setStyle(ButtonStyle.Secondary),
      ),
    );

    const response = await interaction.reply({
      content: `${challenger} challenges ${opponent} to rock, paper, scissors! Pick your move within a minute.`,
      components: [buttons],
      withResponse: true,
    });
    const message = response.resource?.message;
    if (!message) return;

    const players = [challenger, opponent];
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: TIMEOUT_MS,
    });

    collector.on("collect", async (click) => {
      const move = click.customId.slice("rps:".length);
      if (!players.some((p) => p.id === click.user.id)) {
        return click.reply({ content: "This isn't your game. Start one with `/rps`!", flags: MessageFlags.Ephemeral });
      }
      if (picks.has(click.user.id)) {
        return click.reply({ content: "You've already picked.", flags: MessageFlags.Ephemeral });
      }
      if (!isMove(move)) return;

      picks.set(click.user.id, move);
      await click.reply({ content: `You picked ${moves[move].emoji} ${move}.`, flags: MessageFlags.Ephemeral });
      if (picks.size === players.length) collector.stop("done");
    });

    collector.on("end", async (_collected, reason) => {
      const a = picks.get(challenger.id);
      const b = picks.get(opponent.id);
      let content: string;
      if (reason === "done" && a && b) {
        const result = judge(a, b);
        const verdict = result === 0 ? "It's a draw!" : `${result > 0 ? challenger : opponent} wins!`;
        content = `${show(challenger, a)} vs ${show(opponent, b)}\n**${verdict}**`;
      } else {
        const missing = players.filter((p) => !picks.has(p.id));
        content = `Game over: ${missing.join(" and ")} didn't pick in time.`;
      }
      await interaction.editReply({ content, components: [] }).catch(console.error);
    });
  },
} satisfies SlashCommand;
