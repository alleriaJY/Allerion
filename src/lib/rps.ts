export const moves = {
  rock: { emoji: "🪨", beats: "scissors" },
  paper: { emoji: "📄", beats: "rock" },
  scissors: { emoji: "✂️", beats: "paper" },
} as const;

export type Move = keyof typeof moves;

export function isMove(value: string): value is Move {
  return Object.hasOwn(moves, value);
}

/** 1 if a wins, -1 if b wins, 0 for a draw. */
export function judge(a: Move, b: Move): 1 | 0 | -1 {
  if (a === b) return 0;
  return moves[a].beats === b ? 1 : -1;
}
