import { InvalidPlayerNameError } from "./player-errors.js";

// A player's profile. Guests play without one.
export type Player = { id: string; email: string; name: string };

// Who a Google ID token says the player is. `googleId` is the account's `sub`, which never changes.
export type GoogleIdentity = { googleId: string; email: string; name: string };

// A registered player, with the Google account they sign in with.
export type PlayerAccount = Player & GoogleIdentity;

const NAME_LENGTH = { min: 2, max: 20 };

// The name other players see, trimmed.
export const playerName = (name: string): string => {
	const trimmed = name.trim();
	if (trimmed.length < NAME_LENGTH.min || trimmed.length > NAME_LENGTH.max)
		throw new InvalidPlayerNameError(NAME_LENGTH);
	return trimmed;
};
