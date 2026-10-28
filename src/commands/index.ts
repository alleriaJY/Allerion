import type { Command } from "./types.ts";
import adventure from "./adventure.ts";
import avatar from "./avatar.ts";
import choose from "./choose.ts";
import classCommand from "./class.ts";
import daily from "./daily.ts";
import eightBall from "./8ball.ts";
import help from "./help.ts";
import leaderboard from "./leaderboard.ts";
import ping from "./ping.ts";
import profile from "./profile.ts";
import roll from "./roll.ts";
import rps from "./rps.ts";
import sing from "./sing.ts";

// To add a command: create a file in this folder, import it here, then `npm run deploy`.
export const commands: Command[] = [
  // RPG (server only)
  adventure,
  classCommand,
  daily,
  leaderboard,
  profile,
  // Fun (work anywhere)
  ...avatar,
  choose,
  eightBall,
  help,
  ping,
  roll,
  rps,
  sing,
];
