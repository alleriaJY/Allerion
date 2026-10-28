import { ApplicationIntegrationType, InteractionContextType } from "discord.js";

/**
 * Where a command can be used. "everywhere" commands also work as a
 * user-installed app: in DMs and in servers the bot hasn't joined.
 */
export const everywhere = {
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
};

export const serverOnly = {
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
};
