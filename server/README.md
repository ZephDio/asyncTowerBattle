# asyncTowerBattleServer

NestJS server for asyncTowerBattle. It is the `server` package of the monorepo; shared tooling config lives at the root.

- `pnpm start`: run the server on port 6868 (override with `PORT`), restarting on file changes
- `pnpm build` then `pnpm start:prod`: build and run the compiled server
- `pnpm test`, `pnpm typecheck`, `pnpm format`

## Database

The opponent boards live in Postgres, in the `player_board` table. Prisma owns the schema (`prisma/schema.prisma`) and versions it as SQL migrations in `prisma/migrations/`; the devenv shell sets `DATABASE_URL` and points Prisma at the NixOS schema engine.

- `pnpm db:up` / `pnpm db:down`: start or stop the Postgres container of `docker-compose.yml`. Docker is the project's own rootless daemon: the devenv shell starts it on entering the project and `stop-docker` stops it (`devenv up` also starts the container)
- `pnpm start:infra` (from the repository root): start the daemon if needed, then Postgres, then apply the migrations
- `pnpm db:migrate`: apply the pending migrations. The first ones create `player_board` and seed it with the default board of each round
- `pnpm db:migrate:dev --name <change>`: create a migration after changing the schema
- `pnpm db:generate`: regenerate the client in `src/database/generated/prisma` (also run on install, gitignored)

The database generates no ids: the use cases give each new entity (player, refresh token, board) its id from the `IdProvider` of `src/shared/`, a `UuidProvider`, before storing it.

A board is an opponent until another player pulls it, then a legacy board with `pulled_at` set and `pulled_by` naming the board its puller sent in the same request. `player_id` is the logged-in player who sent a board (null for the seed boards). `POST /opponents/:round` reads an optional access token for it and never gives a player one of their own boards. Only a logged-in player's request trades boards: a guest's, or one with `?test=true` (the client's dev mode), gets an opponent without storing its board or consuming the opponent, so guests and dev runs are free reads for trying the game. The tests use the in-memory stores and need no database.

## Players

Players sign in with Google only; guests play without an account. The client's Google button gives an ID token (the `credential`), which the server checks against `GOOGLE_CLIENT_ID` with `google-auth-library`. A player is a `player` row (id, Google `sub`, email, name), created on register.

- `POST /auth/google/register` `{ credential, name }`: create the player (409 if the Google account already has one, 400 for a name outside 2 to 20 characters)
- `POST /auth/google/login` `{ credential }`: log in (404 if the account has no player yet)
- `POST /auth/refresh` `{ refreshToken }`: trade a refresh token for a new session (401 if unknown, expired or already used)
- `POST /auth/logout` `{ refreshToken }`: revoke the refresh token
- `GET /players/me` with `Authorization: Bearer <access token>`: the player's profile

The three first routes answer with a session, `{ player, accessToken, refreshToken }`, that the client keeps in localStorage. The access token is a 15-minute JWT signed with `JWT_SECRET`, with the player id as subject; `AccessTokenGuard` checks it. The refresh token lasts 30 days, is stored hashed in `refresh_token` and is used once: each refresh revokes it and issues the next one. `JWT_SECRET` is required to start; without `GOOGLE_CLIENT_ID` the sign-in routes fail but the rest of the server works. The devenv shell sets both (fill in `GOOGLE_CLIENT_ID` in `devenv.nix`).

With `FAKE_GOOGLE_SIGN_IN=true` the sign-in routes also accept the credential `google:<id>` as the Google account `<id>`, which is how the headless game tools play as a registered player (`start(player=...)`). The devenv shell sets it; a deployed server must not.

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }`.
