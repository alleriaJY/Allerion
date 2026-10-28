import type { Command } from "./types.ts";
import avatar from "./avatar.ts";
import choose from "./choose.ts";
import eightBall from "./8ball.ts";
import help from "./help.ts";
import ping from "./ping.ts";
import roll from "./roll.ts";
import rps from "./rps.ts";
import sing from "./sing.ts";

// To add a command: create a file in this folder, import it here, then `npm run deploy`.
export const commands: Command[] = [
  ...avatar,
  choose,
  eightBall,
  help,
  ping,
  roll,
  rps,
  sing,
];
