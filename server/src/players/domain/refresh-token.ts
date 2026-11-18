// A refresh token of a player's session, valid until `expiresAt`. The token itself is a secret the store creates and
// only keeps hashed.
export type RefreshToken = { id: string; playerId: string; expiresAt: Date };
