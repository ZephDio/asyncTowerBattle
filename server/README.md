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
- `pnpm db:generate`: regenerate the client in `src/generated/prisma` (also run on install, gitignored)

A board is an opponent until another player pulls it, then a legacy board with `pulled_at` set. The tests use the in-memory stores and need no database.

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }`.
