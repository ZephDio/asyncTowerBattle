---
name: integration-test-suite
description: Write the tests of a server store port (server/) as one shared test suite (`<port>.test-suite.ts`) that every implementation runs - the in-memory store in a `*.spec.ts`, the Prisma store in an integration `*.int-spec.ts` on the atb_test database - plus the few checks only one storage can make. Use when adding or changing a store port or one of its implementations, writing integration tests for a Prisma store, making an in-memory store behave like the Prisma one, or when the user mentions a test suite, a contract test or integration tests.
---

# Store test suites (server/)

A store port (an abstract class in `applicative/interfaces/`) has several implementations: a Prisma one for
production and an in-memory one for the unit tests of the use cases and controllers. Both must behave **exactly** the
same, or the unit tests prove nothing about production. So the behavior is written once, as a test suite every
implementation runs, and each implementation adds only what is specific to its storage.

Reference: `server/src/opponents/infrastructure/opponent-board-store/`.

```
<port>-store/
  <port>.test-suite.ts             the shared suite: a function declaring the Jest tests
  in-memory-<port>.store.ts
  in-memory-<port>.store.spec.ts   runs the suite (pnpm test) + in-memory test helper tests
  prisma-<port>.store.ts
  prisma-<port>.store.int-spec.ts  runs the suite on Postgres (pnpm test:integration) + storage tests
```

The suite file ends in `.test-suite.ts`, so Jest (`*.spec.ts`, `*.int-spec.ts`) never runs it on its own.

## The suite

A function taking a name and the implementation's params, and declaring a `describe` with every behavior of the port:

```ts
export type OpponentBoardStoreSuiteParams = {
	// A store drawing its random offsets from `random`. Called before each test, after `clear`.
	createStore: (random: RandomProvider) => OpponentBoardStore;
	// Makes a player who can own boards and gives back their id.
	addPlayer: (name: string) => Promise<string>;
	// Deletes the player: their boards stay, owned by nobody.
	removePlayer: (id: string) => Promise<void>;
	// The boards that pulled the board, whether it was removed or not. The port never reads a removed board back.
	pullersOf: (id: string) => Promise<readonly string[]>;
	// Empties everything the store and the players keep.
	clear: () => Promise<void>;
	// Releases what the implementation holds (connections) once the suite is done.
	close?: () => Promise<void>;
};

export const opponentBoardStoreSuite = (name: string, params: OpponentBoardStoreSuiteParams) =>
	describe(`${name} (OpponentBoardStore suite)`, () => {
		let store: OpponentBoardStore;
		let offsets: number[] = [];
		const random: RandomProvider = { next: () => offsets.shift() ?? 0 };

		beforeEach(async () => {
			offsets = [];
			await params.clear();
			store = params.createStore(random);
		});

		afterAll(async () => {
			await params.close?.();
		});

		describe("pickOne", () => {
			it("picks the board at the random offset among the round's boards, oldest first", async () => { ... });
		});
	});
```

Rules for the params:

- **`createStore(...)`, not a store**: the suite makes a fresh store before each test, after `clear`, and passes in
  what it must control. Ports injected into the store (`RandomProvider`, `IdProvider`) come from the suite, so picks are
  deterministic (`offsets = [0, 0.5, 0.99]` picks the first, middle and last).
- **Arrange what the port can't**: state the store depends on but doesn't own (players and their deletion, a foreign
  key's `ON DELETE SET NULL`) is a param (`addPlayer`, `removePlayer`). Don't pass the store's own methods as params:
  the suite calls them on the store.
- **Read what the port can't**: a behavior the port promises but never reads back (the pullers of a consumed board) is
  checked through a read param (`pullersOf`). Each implementation answers from its own storage: the Prisma row, the
  in-memory map. Keep these few; most checks go through the port.
- `clear` empties everything the tests touch; `close` is optional.

Rules for the tests:

- Go through the port: `add` then `count`/`pickOne`, never a row or a map. A test that needs a row is a storage test.
- Name each test after the behavior (`"counts a board out once under concurrent removes, recording every puller"`).
- Concurrency belongs in the suite when it's part of the contract (`Promise.all` of 8 removes consume once): the
  in-memory store passes trivially, the Prisma one proves its transaction.
- Add rows one at a time (`for ... await store.add`) when the order matters ("oldest first"), so `created_at` follows.
- Export the fixture builders the implementation files also need (`opponentBoard(round, seed, playerId?)`).
- Write the contract the suite checks into the port's comments, so a reader of the port knows it without the tests.

## In-memory implementation file

```ts
let current: InMemoryOpponentBoardStore;

opponentBoardStoreSuite("InMemoryOpponentBoardStore", {
	createStore: (random) => {
		current = new InMemoryOpponentBoardStore(random);
		return current;
	},
	addPlayer: async () => crypto.randomUUID(),
	removePlayer: (id) => current.forgetPlayer(id),
	pullersOf: (id) => current.pullersOf(id),
	clear: async () => {},
});

describe("InMemoryOpponentBoardStore test helpers", () => { ... });
```

- A fresh instance per test, so `clear` does nothing. Keep the latest instance in `current` for the params that read
  or change it.
- The in-memory store **mirrors the Prisma one**, including what the port doesn't show: it keeps consumed boards and
  their pullers like the rows do. When the suite fails on in-memory only, fix the store, never the suite.
- What the database does by itself (a foreign key nulling the owner) is a test-only method on the in-memory class
  (`forgetPlayer`), as are the reads (`pullersOf`) and the helpers other specs use (`seeded`, `findByRound`, `rounds`).
  They live on the class, never on the port. Their own tests follow the suite in this file.

## Prisma implementation file

```ts
import { assertTestDatabase } from "../../../database/test-database.js";

// Runs the store on the database that `pnpm test:integration` migrates.
assertTestDatabase();

const prisma = new PrismaService();

const clear = async () => {
	await prisma.$transaction([prisma.playerBoard.deleteMany(), prisma.player.deleteMany(), prisma.roundBoardCount.deleteMany()]);
};

// The projection must match the rows after every test, the suite's included.
afterEach(async () => { ... });

afterAll(async () => {
	await prisma.$disconnect();
});

opponentBoardStoreSuite("PrismaOpponentBoardStore", {
	createStore: (random) => new PrismaOpponentBoardStore(prisma, random),
	addPlayer,
	removePlayer: async (id) => { await prisma.player.delete({ where: { id } }); },
	pullersOf: async (id) => (await rowOf(id)).pulledBy,
	clear,
});

describe("PrismaOpponentBoardStore rows", () => { ... });
```

- **`assertTestDatabase()` first**: the tests empty their tables, so the file refuses any `DATABASE_URL` that doesn't
  name a test database (`database/test-database.ts`).
- Build the store directly on a `PrismaService`, no Nest module: the suite injects what it needs.
- `clear` deletes every table the tests touch, children before parents, in one transaction: back to the state the
  migrations leave.
- **Invariants of the storage in a file-level `afterEach`**: it applies to the suite's tests too. A projection
  (`round_board_count`) must equal a `groupBy` of the rows; a round emptied by consumption keeps its row at 0, which
  counts the same as no row (`where: { count: { gt: 0 } }`).
- One `afterAll` disconnects; leave the suite's `close` out when the file owns the client.
- The storage tests after the suite are only what the rows show: the columns an entity is stored in, timestamps
  (`pulled_at` keeps the first consumption), indexes, archiving, stress tests.

## What goes where

| Check | Where |
| --- | --- |
| Any behavior the port promises, observable through it or a read param | the suite |
| Concurrency the contract promises | the suite |
| Columns, timestamps, constraints, projections, indexes, stress | the Prisma `int-spec` |
| Test helpers of the in-memory class (`seeded`, `findByRound`) | the in-memory `spec` |

If a check ends up in only one implementation file but describes behavior, the two implementations differ: make the
other one behave the same and move the test into the suite.

## Running

- `pnpm test:integration` (from the root) needs Postgres up (`pnpm start:infra`). It applies the Prisma migrations to
  `atb_test` (`TEST_DATABASE_URL`, set by the devenv shell) and runs every `*.int-spec.ts` with `--runInBand`.
- `pnpm test` runs the in-memory side with the other unit tests.
- Run both, plus `pnpm typecheck`, after changing a port, a store or its suite. Run the integration tests a few times
  when they involve concurrency or ordering.

## Adding a store

1. Write the port with its contract in comments (`applicative/interfaces/<port>.store.ts`).
2. Write the suite, then the in-memory store until its spec passes.
3. Write the Prisma store and its `int-spec` until the suite passes on Postgres, then add the storage tests.
4. Bind the Prisma store in the module; use the in-memory one in the use case and controller specs.
