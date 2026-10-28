import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  UserContextMenuCommandInteraction,
} from "discord.js";

interface CommandData {
  name: string;
  toJSON(): RESTPostAPIApplicationCommandsJSONBody;
}

export interface SlashCommand {
  kind: "slash";
  data: CommandData;
  execute(interaction: ChatInputCommandInteraction): Promise<unknown>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<unknown>;
}

/** Right-click a user -> Apps -> this command. */
export interface UserMenuCommand {
  kind: "user";
  data: CommandData;
  execute(interaction: UserContextMenuCommandInteraction): Promise<unknown>;
}

/** Right-click a message -> Apps -> this command. */
export interface MessageMenuCommand {
  kind: "message";
  data: CommandData;
  execute(interaction: MessageContextMenuCommandInteraction): Promise<unknown>;
}

export type Command = SlashCommand | UserMenuCommand | MessageMenuCommand;
