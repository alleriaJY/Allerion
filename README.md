# Allerion

A Discord bot made for fun, rebuilt in 2026 with TypeScript and discord.js v14.
The original 2019 bot is still in the git history.

## Commands

| Command | What it does |
|---|---|
| `/help` | Lists every command, with clickable links |
| `/ping` | Checks the bot is awake |
| `/roll [dice]` | Rolls dice: `d20`, `2d6`, `3d8+2`, or just `100` |
| `/choose options` | Picks one of several options: `pizza, sushi, tacos` |
| `/8ball question` | Magic 8-ball |
| `/sing` | Sings a random line (from the old `a!randomsing`) |
| `/avatar [user]` | Shows an avatar in full size. Also: right-click a user → Apps → **View avatar** |
| `/rps [opponent]` | Rock, paper, scissors with buttons, against a friend or the bot |

Every command also works as a **user-installed app**: in DMs, group chats, and servers the bot hasn't joined.

## Setup

You need Node.js 22.18 or newer. Node runs the TypeScript files directly, so there is no build step.

1. Create an application at <https://discord.com/developers/applications>.
2. Under **Installation**, tick both **Guild Install** and **User Install**. Give Guild Install the
   `applications.commands` and `bot` scopes.
3. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`.
   While developing, also set `DEV_GUILD_ID` to your test server so command changes show up instantly.
4. Install and run:

```bash
npm install
npm run deploy   # register the commands with Discord (re-run after changing any command)
npm start        # or `npm run dev` to restart automatically on file changes
```

## Adding a command

1. Create `src/commands/<name>.ts` exporting a `SlashCommand` (copy `ping.ts` as a starting point).
   Use `everywhere` from `src/lib/install.ts` for commands that work anywhere, or `serverOnly` for
   ones that need a server.
2. Add it to the list in `src/commands/index.ts`.
3. Run `npm run deploy`.

Put logic that doesn't depend on Discord in `src/lib/` and test it in `src/lib/*.test.ts`.

## Checks

```bash
npm run typecheck
npm test
```

## Hosting

The bot is one long-running Node process. Any host that keeps a process running works:
a small VPS, Railway, Fly.io, or a Raspberry Pi. Set `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` as environment variables there.
