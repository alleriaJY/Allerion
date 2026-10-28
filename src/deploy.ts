// Registers the slash and context-menu commands with Discord. Run after adding or changing a command.
import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";

const rest = new REST().setToken(config.token);
const body = commands.map((c) => c.data.toJSON());

if (config.devGuildId) {
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.devGuildId), { body });
  console.log(`Registered ${body.length} commands to server ${config.devGuildId}.`);
} else {
  await rest.put(Routes.applicationCommands(config.clientId), { body });
  console.log(`Registered ${body.length} commands globally.`);
}
