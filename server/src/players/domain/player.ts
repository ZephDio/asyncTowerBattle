import { InvalidEmailError, InvalidPasswordError, InvalidPlayerNameError } from "./player-errors.js";

// A player's profile. Guests play without one.
export type Player = { id: string; email: string; name: string };

// Who a Google ID token says the player is. `googleId` is the account's `sub`, which never changes.
export type GoogleIdentity = { googleId: string; email: string; name: string };

// A registered player, with how they sign in: the Google account, or the hash of their password.
export type PlayerAccount = Player & { googleId?: string; passwordHash?: string };

const NAME_LENGTH = { min: 2, max: 20 };

// The name other players see, trimmed. No two players share one, ignoring case.
export const playerName = (name: string): string => {
	const trimmed = name.trim();
	if (trimmed.length < NAME_LENGTH.min || trimmed.length > NAME_LENGTH.max)
		throw new InvalidPlayerNameError(NAME_LENGTH);
	return trimmed;
};

const EMAIL_MAX_LENGTH = 254;

// Trimmed and in lower case, so it compares equal however the player typed it. No two players share one.
export const playerEmail = (email: string): string => {
	const normalized = email.trim().toLowerCase();
	if (normalized.length > EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
		throw new InvalidEmailError();
	return normalized;
};

const PASSWORD_LENGTH = { min: 8, max: 128 };

// Kept as typed, spaces included.
export const playerPassword = (password: string): string => {
	if (password.length < PASSWORD_LENGTH.min || password.length > PASSWORD_LENGTH.max)
		throw new InvalidPasswordError(PASSWORD_LENGTH);
	return password;
};
