import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../../shared/applicative/interfaces/id-provider.js";
import { RandomProvider } from "../../../shared/applicative/interfaces/random-provider.js";
import { MathRandomProvider } from "../../../shared/infrastructure/math-random-provider.js";
import { UuidProvider } from "../../../shared/infrastructure/uuid-provider.js";
import { OpponentBoardStore } from "../../applicative/interfaces/opponent-board.store.js";
import { PlayerBoard, type PlayerBoardProps } from "../../domain/player-board.js";

// Keeps every board as its JSON string, by id in the order added, so callers never share or mutate a stored board.
// Like the Prisma store, a consumed board stays with every board that pulled it, out of the available ones.
@Injectable()
export class InMemoryOpponentBoardStore extends OpponentBoardStore {
	private readonly boards = new Map<string, string>();
	private readonly consumed = new Set<string>();

	constructor(private readonly random: RandomProvider = new MathRandomProvider()) {
		super();
	}

	// For the tests: gives the boards their ids and no puller yet.
	static seeded(playerBoards: Omit<PlayerBoardProps, "id" | "pulledBy">[], ids: IdProvider = new UuidProvider()) {
		const store = new InMemoryOpponentBoardStore();
		for (const props of playerBoards) store.save(new PlayerBoard({ ...props, id: ids.next() }));
		return store;
	}

	async add(playerBoard: PlayerBoard) {
		this.save(playerBoard);
	}

	async count(round: number) {
		return (await this.findByRound(round)).length;
	}

	async pickOne(round: number, notOwnedBy?: string) {
		const boards = await this.findByRound(round, notOwnedBy);
		if (boards.length === 0) return undefined;
		return boards[Math.floor(this.random.next() * boards.length)];
	}

	// Also records the puller of a board consumed since it was found.
	async markPulled(id: string, pulledBy: string) {
		const stored = this.load(id);
		if (stored) this.save(stored.pulledByBoard(pulledBy));
	}

	// Only the first remove consumes the board, but every one records its puller.
	async remove(id: string, pulledBy: string) {
		await this.markPulled(id, pulledBy);
		if (this.boards.has(id)) this.consumed.add(id);
	}

	// For the tests: the available boards of the round, oldest first, leaving out those of `notOwnedBy` when it is given.
	async findByRound(round: number, notOwnedBy?: string): Promise<PlayerBoard[]> {
		return this.available(notOwnedBy).filter((board) => board.round === round);
	}

	// For the tests: every round that has at least one available board, leaving out those of `notOwnedBy` when given.
	async rounds(notOwnedBy?: string) {
		const rounds = new Set(this.available(notOwnedBy).map(({ round }) => round));
		return [...rounds].sort((left, right) => left - right);
	}

	// For the tests: the boards that pulled the board, consumed or not, oldest first.
	async pullersOf(id: string) {
		return this.load(id)?.pulledBy ?? [];
	}

	// For the tests: what deleting the player does to the database, their boards stay but are owned by nobody.
	async forgetPlayer(playerId: string) {
		for (const id of this.boards.keys()) {
			const board = this.load(id)!;
			if (board.playerId === playerId) this.save(new PlayerBoard({ ...board.toProps(), playerId: undefined }));
		}
	}

	// The boards not consumed yet, oldest first, leaving out those of `notOwnedBy` when it is given.
	private available(notOwnedBy: string | undefined) {
		return [...this.boards.keys()]
			.filter((id) => !this.consumed.has(id))
			.map((id) => this.load(id)!)
			.filter((board) => notOwnedBy === undefined || board.playerId !== notOwnedBy);
	}

	private save(playerBoard: PlayerBoard) {
		this.boards.set(playerBoard.id, JSON.stringify(playerBoard.toProps()));
	}

	private load(id: string) {
		const stored = this.boards.get(id);
		return stored === undefined ? undefined : new PlayerBoard(JSON.parse(stored));
	}
}
