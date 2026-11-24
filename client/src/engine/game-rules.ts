// A run lasts until the player is out of lives or has played the last round, whichever comes first.
export const MAX_LIVES = 5;
// Lives a new run starts with. Set it to 1 to reach the end of a run quickly while testing.
export const STARTING_LIVES = MAX_LIVES;
export const MAX_ROUNDS = 16;

export const isLastRound = (round: number) => round >= MAX_ROUNDS;

// The run ends when the player has no life left or the last round has been played.
export const isRunOver = (life: number, round: number) => life <= 0 || isLastRound(round);
