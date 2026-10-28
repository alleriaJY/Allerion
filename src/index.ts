import { ActivityType, Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";
import { onMessage } from "./events/chatXp.ts";

const byName = new Map(commands.map((c) => [c.data.name, c]));

const client = new Client({
  // GuildMessages lets chat earn XP; the bot never needs to read message text, so the
  // privileged MessageContent intent stays off. Privileged intents (e.g. GuildMembers for
  // welcome messages) must also be enabled in the Developer Portal.
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  presence: { activities: [{ name: "/help", type: ActivityType.Listening }] },
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}, ${byName.size} commands loaded.`);
});

client.on(Events.MessageCreate, (message) => {
  onMessage(message).catch((error) => console.error("Chat XP failed:", error));
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = byName.get(interaction.commandName);
    if (command?.kind === "slash") await command.autocomplete?.(interaction).catch(console.error);
    return;
  }
  if (!interaction.isCommand()) return;

  const command = byName.get(interaction.commandName);
  try {
    if (interaction.isChatInputCommand() && command?.kind === "slash") {
      await command.execute(interaction);
    } else if (interaction.isUserContextMenuCommand() && command?.kind === "user") {
      await command.execute(interaction);
    } else if (interaction.isMessageContextMenuCommand() && command?.kind === "message") {
      await command.execute(interaction);
    } else {
      await interaction.reply({
        content: "I don't know that command anymore. Try `/help`.",
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error(`/${interaction.commandName} failed:`, error);
    const reply = { content: "Something went wrong running that command.", flags: MessageFlags.Ephemeral } as const;
    if (interaction.replied || interaction.deferred) await interaction.followUp(reply).catch(() => {});
    else await interaction.reply(reply).catch(() => {});
  }
});

await client.login(config.token);
