# asyncTowerBattleServer

NestJS server for asyncTowerBattle. It is the `server` package of the monorepo; shared tooling config lives at the root.

- `pnpm start`: regenerate the Prisma client and apply the pending migrations, then run the server on port 6868 (override with `PORT`), restarting on file changes. Postgres must be up (`pnpm start:infra`), or it stops at the migration step; a schema change pulled while it runs is applied at the next `pnpm start`
- `pnpm build` then `pnpm start:prod`: build and run the compiled server
- `pnpm test`, `pnpm typecheck`, `pnpm format`

## Database

The opponent boards live in Postgres, in the `player_board` table. Prisma owns the schema (`prisma/schema.prisma`) and versions it as SQL migrations in `prisma/migrations/`; the devenv shell sets `DATABASE_URL` and points Prisma at the NixOS schema engine.

- `pnpm db:up` / `pnpm db:down`: start or stop the Postgres container of `docker-compose.yml`. Docker is the project's own rootless daemon: the devenv shell starts it on entering the project and `stop-docker` stops it (`devenv up` also starts the container)
- `pnpm start:infra` (from the repository root): start the daemon if needed, then Postgres, then apply the migrations
- `pnpm db:migrate`: apply the pending migrations. The first ones create `player_board` and seed it with the default board of each round
- `pnpm db:migrate:dev --name <change>`: create a migration after changing the schema
- `pnpm test:integration` (also from the repository root): migrate the `atb_test` database of the same Postgres (`TEST_DATABASE_URL`, set by the devenv shell) and run the `*.int-spec.ts` tests on the Prisma stores. They empty that database before each test
- `pnpm db:generate`: regenerate the client in `src/database/generated/prisma` (also run on install, gitignored)

The database generates no ids: the use cases give each new entity (player, refresh token, board) its id from the `IdProvider` of `src/shared/`, a `UuidProvider`, before storing it.

Each pull adds the board its puller sent in the same request to the opponent's `pulled_by` array. A round keeps its boards available while it holds no more than 50 (`ROUND_POOL_SIZE`), so they can be pulled many times; past that, a pull consumes the opponent, which becomes a legacy board with `pulled_at` set. `round_board_count` is the projection of each round's available boards, which the board store updates in the same transaction as the rows. An opponent is always a board of the same round, so of the same grid size. When the round has no board from another player, a pull gives the round's default board, one per round in `src/opponents/domain/default-boards.ts` (the client's `LocalMatchMaker` boards). The default boards are not in the database, so they are never consumed, and a logged-in player's board is still stored. `player_id` is the logged-in player who sent a board. `POST /opponents/:round` reads an optional access token for it and never gives a player one of their own boards. Only a logged-in player's request trades boards: a guest's, or one with `?test=true` (the client's dev mode), gets an opponent without storing its board or consuming the opponent, so guests and dev runs are free reads for trying the game. The tests use the in-memory stores and need no database.

## Players

Players sign in with Google or with their email or player name and password; guests play without an account. The client's Google button gives an ID token (the `credential`), which the server checks against `GOOGLE_CLIENT_ID` with `google-auth-library`. A player is a `player` row (id, email, name, and their Google `sub` or their password hash), created on register. No two players share an email (stored in lower case) or a name (ignoring case), whichever way they sign in. A password is stored as its salted scrypt hash (`ScryptPasswordHasher`), never as typed.

- `POST /auth/google/register` `{ credential, name }`: create the player (409 if the Google account already has one or its email or the name is taken, 400 for a name outside 2 to 20 characters)
- `POST /auth/google/login` `{ credential }`: log in (404 if the account has no player yet)
- `POST /auth/password/register` `{ email, name, password }`: create the player (409 if the email or name is taken, 400 for an invalid email, a name outside 2 to 20 characters or a password outside 8 to 128)
- `POST /auth/password/login` `{ identifier, password }`: log in with the email or the player name (401 for an unknown identifier or a wrong password, alike)
- `POST /auth/refresh` `{ refreshToken }`: trade a refresh token for a new session (401 if unknown, expired or already used)
- `POST /auth/logout` `{ refreshToken }`: revoke the refresh token
- `GET /players/me` with `Authorization: Bearer <access token>`: the player's profile
- `GET /players/me/steps` with the same header: the player's "first time" steps, `{ tutorialSeen }`. They live in the `player_steps` table, one row per player created with their first step, and a missing row means none done. A new step is a new column that defaults to false.
- `POST /players/me/steps/tutorial-seen` with the same header: record that the tutorial opened by itself for the player (204)

The four first routes and the refresh answer with a session, `{ player, accessToken, refreshToken }`, that the client keeps in localStorage. The access token is a 15-minute JWT signed with `JWT_SECRET`, with the player id as subject; `AccessTokenGuard` checks it. The refresh token lasts 30 days, is stored hashed in `refresh_token` and is used once: each refresh revokes it and issues the next one. `JWT_SECRET` is required to start; without `GOOGLE_CLIENT_ID` the sign-in routes fail but the rest of the server works. The devenv shell sets both (fill in `GOOGLE_CLIENT_ID` in `devenv.nix`).

With `FAKE_GOOGLE_SIGN_IN=true` the sign-in routes also accept the credential `google:<id>` as the Google account `<id>`, which is how the headless game tools play as a registered player (`start(player=...)`). The devenv shell sets it; a deployed server must not.

## Current game

A logged-in player can leave a game and continue it. The `current_game` table holds one row per player: the client's saved game as JSON (`SavedGame`, `src/current-games/domain/current-game.ts`), deleted with its player. The client replaces it at the start of each shop (the army, its reserve, the gold, the lives, the performance and the run's seed) and at the start of each battle (the same, plus the opponent board it was matched with and that board's player name), so a player who leaves a shop restarts that shop and one who leaves a battle replays it against the same opponent. The row is deleted when the player's last life is lost. `CurrentGame` refuses a game whose boards break the board rules, whose battle has no opponent (or whose shop has one), or whose life, gold or performance aren't counts.

All three routes need `Authorization: Bearer <access token>` (401 otherwise):

- `GET /current-game`: `{ "game": SavedGame | null }`, `null` when the player has no running game
- `PUT /current-game` with a `SavedGame`: replace the player's game (204; 400 for a body of the wrong shape or one breaking the rules)
- `DELETE /current-game`: forget the player's game (204, also when there is none)

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }`.
