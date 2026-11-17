# asyncTowerBattleServer

NestJS server for asyncTowerBattle.

- `pnpm start`: run the server on port 6868 (override with `PORT`), restarting on file changes
- `pnpm build` then `pnpm start:prod`: build and run the compiled server
- `pnpm test`, `pnpm typecheck`, `pnpm format`

`GET /health` returns `{ "status": "ok", "uptime": <seconds> }`.
