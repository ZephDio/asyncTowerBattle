---
name: backend-architecture
description: The DDD / clean architecture rules of the NestJS server (server/) - layers (domain, applicative, infrastructure), self-validating entity classes, controllers that parse and instantiate before any use case, short use cases without if/else, stores that query and pick with indexes, ports for ids and randomness, static reference data, Prisma migrations and tests. Use when writing, refactoring or reviewing any server code - a new module, route, use case, entity, store, migration or test - or when the user asks how the backend is organized.
---

# Backend architecture (server/)

The server is a NestJS app split by module (`opponents/`, `players/`, `health/`), each module in three layers. These
rules come from the user's reviews; `server/src/opponents/` follows all of them and is the reference to copy. The
`players/` module predates some of them (entity classes, controller-side instantiation): bring it in line when you touch
it, and don't copy its older patterns into new code.

## Layers

```
<module>/
  domain/            entities, value objects, rules, domain errors, static reference data
  applicative/
    commands/        use cases (one class per use case, `execute`)
    queries/         read-only use cases
    interfaces/      output ports: stores, providers (abstract classes)
  infrastructure/    controllers, request parsers, Prisma and in-memory stores, provider implementations
  <module>.module.ts composition root: binds each port to its implementation
```

- The word is **applicative**, not "application".
- Dependencies point inward: infrastructure → applicative → domain. The domain imports nothing from the other layers
  and no framework (no Nest, no Prisma).
- **Ports belong to their consumer**, in `applicative/interfaces/`, never in `domain/`. A port is an `abstract class`
  so it is also the Nest injection token (`{ provide: OpponentBoardStore, useClass: PrismaOpponentBoardStore }`).
- Ports shared by every module (`IdProvider`, `RandomProvider`) live in `shared/applicative/interfaces/`, their
  implementations (`UuidProvider`, `MathRandomProvider`) in `shared/infrastructure/`, exported by `SharedModule`.
- HTTP concerns (Nest exceptions, status codes, request bodies) stay in infrastructure. Errors about storage or lookups
  are applicative; only game rules are domain errors.

## Entities validate themselves

An entity is a class whose constructor checks every invariant and throws a domain error, so an invalid instance never
exists. Reference: `domain/player-board.ts`.

```ts
export class PlayerBoard {
	readonly id: string;
	readonly board: SerializedBoard;
	readonly performance: GamePerformance;
	readonly playerId: string | undefined;
	readonly pulledBy: readonly string[];

	constructor({ id, board, performance, playerId, pulledBy = [] }: PlayerBoardProps) {
		assertBoardRules(board);
		assertPerformance(performance);
		this.id = id;
		// ...
	}

	pulledByBoard(boardId: string) {
		return new PlayerBoard({ ...this.toProps(), pulledBy: [...this.pulledBy, boardId] });
	}

	toProps(): PlayerBoardProps { /* plain data for the stores */ }
}
```

- **Immutable**: `readonly` fields; a change returns a new instance (`pulledByBoard`), never mutates.
- **Props type** (`PlayerBoardProps`) for construction and persistence; `toProps()` gives it back.
- Rules shared with other code (the board rules also apply to the default boards) are plain `assert*` functions in the
  domain (`domain/board-rules.ts`), called by the constructor.
- The domain errors of an entity extend one abstract base class (`PlayerBoardRuleError` in
  `domain/opponent-errors.ts`), so callers catch the family without listing every type.
- Don't use branded types (`CheckedBoard`) to mark validity: holding the entity is the proof.

## Controllers: parse, instantiate, then call the use case

The use case never deals with a malformed request. The controller turns the raw request into valid domain objects,
and any failure is a misuse of the API: a 400. Reference: `infrastructure/opponents.controller.ts`.

1. **Shape**: take `@Body() body: unknown` and parse it with plain TypeScript type guards in an infrastructure parser
   (`infrastructure/pull-request-body.ts`, no validation library). It checks presence and JSON types, enums (factions,
   element kinds) and nested shapes, and throws `BadRequestException`. It does not check rules (sizes, ranges): those
   are the domain's.
2. **API consistency**: checks between parts of the request (the path's round equals the body's round) are made here
   and answered with a 400 directly.
3. **Instantiate**: build the entity (`new PlayerBoard({ id: this.ids.next(), ... })`). The controller gets
   `IdProvider` injected. Catch the entity's base error class and rethrow it as `BadRequestException(error.message)`;
   rethrow anything else.
4. **Call** the use case with the entity: `execute({ playerBoard, test })`.

Stay **forward compatible** where clients can be ahead of the server: piece types are only checked to be strings, so a
new piece of a newer client (the Bosquet) needs no server change. Enumerate only what the server itself relies on.

## Use cases: short, named steps, no if/else

- `execute` reads as a short sequence of named steps. Each behavior that splits goes into its own private function,
  with guard clauses and early returns. No `if ... else`, no nested branches.

```ts
async execute({ playerBoard, test }: PullOpponentRequest): Promise<Opponent> {
	const { round, playerId } = playerBoard;
	const opponent = await this.opponentBoards.pickOne(round, playerId);
	if (!test && playerId) await this.trade(playerBoard, opponent);
	return this.describe(opponent, round);
}

private async recordPull(opponent: PlayerBoard, boardId: string) {
	if (pullConsumes(await this.opponentBoards.count(opponent.round))) return this.consume(opponent, boardId);
	await this.opponentBoards.markPulled(opponent.id, boardId);
}
```

- The request type carries entities (`{ playerBoard: PlayerBoard; test: boolean }`), not raw fields.
- A use case doesn't validate: the entities it receives are valid. It orchestrates ports and domain functions.
- Don't throw to mean "nothing found" when the domain has a sensible fallback (no opponent → the round's default
  board, still storing the player's board), so the client never gets a 404 for a normal situation.

## Stores: ask for what you need, let the store query

- The applicative layer asks the store a precise question with its parameters (`pickOne(round, notOwnedBy?)`), it
  doesn't load a collection to filter, sort or pick in memory.
- Ask for exactly what the domain needs, and lean on what the domain guarantees instead of re-deriving it: an opponent
  is a board of the **same round**, and the round fixes the grid size (`domain/board-rules.ts`), so no store query
  matches on grid size or falls back to other rounds; a round without a fitting board gets its default board.
- The store answers with indexes: the Prisma store counts on the `(round, pulled_at)` index, draws a random offset and
  reads **one** row, which is the only one turned into an entity. Handle the race where rows change between
  the count and the read (fall back to the first row left).
- Randomness and ids come from ports (`RandomProvider`, `IdProvider`), injected, so tests pick deterministically. Read
  `Math.random` at call time in the implementation so tests can still replace it.
- Stores take and return entities. They persist `toProps()` and rebuild with `new Entity(...)` when loading, so loaded
  data goes through the same invariants. In-memory stores keep JSON strings so callers never share a stored object.
- Every store port has a Prisma implementation (`infrastructure/prisma-*.store.ts`) and an in-memory one
  (`infrastructure/in-memory-*.store.ts`) for the unit tests. Test-only helpers (`findByRound`, `rounds`, `seeded`) live
  on the in-memory class, not on the port.
- Projections (`round_board_count`) are updated in the same transaction as the rows they count.

## Static reference data lives in the domain code

Data that never changes at runtime and must always exist (the default opponent boards) is a constant in `domain/`
(`domain/default-boards.ts`), checked against the domain rules once at startup, not seeded into the database. It is
never consumed or counted, and changing it is a code change, not a migration.

## Prisma and migrations

- Never edit or delete a migration once it ran anywhere: Prisma refuses a database whose applied migration is
  missing or changed. Undo it with a new migration (`20261119120000_drop_bot_boards` deletes what the seed migration
  inserted and drops its column).
- A migration that changes rows also fixes the projections (`DELETE` then `INSERT ... SELECT count(*)`).
- After changing `schema.prisma`, run `pnpm exec prisma generate` in `server/` (the client in
  `src/database/generated/` is git-ignored), apply with `pnpm db:migrate` locally, and the Docker stack applies them at
  start. Keep the database `CHECK` constraints in line with the domain rules.

## Tests

- **Domain**: the entity's spec tests every invariant through the constructor (`domain/player-board.spec.ts`), and
  domain functions get their own spec (`domain/board-rules.spec.ts`).
- **Parser**: its spec covers each malformed shape and shows that a well-shaped but rule-breaking body passes through
  to the domain (`infrastructure/pull-request-body.spec.ts`).
- **Use case**: in-memory stores, entities built the way the controller builds them; no validation tests there,
  validation is tested where it lives.
- **Controller**: Nest testing module with in-memory stores, checking statuses and bodies, 400s included.
- **Integration**: `*.int-spec.ts` on the `atb_test` database (`pnpm test:integration`) for the Prisma stores and
  migrations. Each test empties the tables it uses.
- Run `pnpm typecheck`, `pnpm test` and `pnpm test:integration` from the root after a server change, and hit the
  running server on port 6868 with `curl` for the changed route.

## Style

- Comments explain why and the rules a reader can't see from the code, in full sentences, wrapped at 120 columns.
- Format with `pnpm format` (Biome); it may reflow unrelated files: revert those to keep the change focused.
