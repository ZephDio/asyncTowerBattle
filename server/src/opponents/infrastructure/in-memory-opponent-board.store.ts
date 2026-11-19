import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../shared/applicative/interfaces/id-provider.js";
import { RandomProvider } from "../../shared/applicative/interfaces/random-provider.js";
import { MathRandomProvider } from "../../shared/infrastructure/math-random-provider.js";
import { UuidProvider } from "../../shared/infrastructure/uuid-provider.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import { PlayerBoard, type PlayerBoardProps } from "../domain/player-board.js";

// Keeps every board as its JSON string, grouped by round then by id, so callers never share or mutate a stored board.
@Injectable()
export class InMemoryOpponentBoardStore extends OpponentBoardStore {
	private readonly boardsByRound = new Map<number, Map<string, string>>();

	constructor(private readonly random: RandomProvider = new MathRandomProvider()) {
		super();
	}

	// For the tests: gives the boards their ids and no puller yet.
	static seeded(playerBoards: Omit<PlayerBoardProps, "id" | "pulledBy">[], ids: IdProvider = new UuidProvider()) {
		const store = new InMemoryOpponentBoardStore();
		for (const props of playerBoards) store.addNow(new PlayerBoard({ ...props, id: ids.next() }));
		return store;
	}

	async add(playerBoard: PlayerBoard) {
		this.addNow(playerBoard);
	}

	private addNow(playerBoard: PlayerBoard) {
		const boards = this.boardsByRound.get(playerBoard.board.round) ?? new Map<string, string>();
		boards.set(playerBoard.id, JSON.stringify(playerBoard.toProps()));
		this.boardsByRound.set(playerBoard.board.round, boards);
	}

	async count(round: number) {
		return this.boardsByRound.get(round)?.size ?? 0;
	}

	async pickOne(round: number, notOwnedBy?: string) {
		const boards = await this.findByRound(round, notOwnedBy);
		if (boards.length === 0) return undefined;
		return boards[Math.floor(this.random.next() * boards.length)];
	}

	// For the tests: the boards of the round, leaving out those of `notOwnedBy` when it is given.
	async findByRound(round: number, notOwnedBy?: string): Promise<PlayerBoard[]> {
		return [...(this.boardsByRound.get(round)?.values() ?? [])]
			.map((board) => new PlayerBoard(JSON.parse(board)))
			.filter((board) => notOwnedBy === undefined || board.playerId !== notOwnedBy);
	}

	async markPulled(id: string, pulledBy: string) {
		for (const boards of this.boardsByRound.values()) {
			const stored = boards.get(id);
			if (stored === undefined) continue;
			const playerBoard = new PlayerBoard(JSON.parse(stored)).pulledByBoard(pulledBy);
			boards.set(id, JSON.stringify(playerBoard.toProps()));
			return;
		}
	}

	// Nothing keeps the consumed boards, so `pulledBy` only matters to the legacy store.
	async remove(id: string, _pulledBy: string) {
		for (const [round, boards] of this.boardsByRound) {
			if (!boards.delete(id)) continue;
			if (boards.size === 0) this.boardsByRound.delete(round);
			return;
		}
	}

	// For the tests: every round that has at least one board, leaving out those of `notOwnedBy` when it is given.
	async rounds(notOwnedBy?: string) {
		const rounds: number[] = [];
		for (const round of this.boardsByRound.keys()) {
			if ((await this.findByRound(round, notOwnedBy)).length > 0) rounds.push(round);
		}
		return rounds;
	}
}
