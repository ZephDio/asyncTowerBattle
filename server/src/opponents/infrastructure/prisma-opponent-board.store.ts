import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { RandomProvider } from "../../shared/applicative/interfaces/random-provider.js";
import type { PlayerBoard as PlayerBoardRow } from "../../database/generated/prisma/client.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import { PlayerBoard } from "../domain/player-board.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

// A row holds a valid board, which only PlayerBoard makes and the player_board_board_check constraint also enforces.
const toPlayerBoard = ({ id, board, wins, losses, playerId, pulledBy }: PlayerBoardRow) =>
	new PlayerBoard({
		id,
		board: board as SerializedBoard,
		performance: { wins, losses },
		playerId: playerId ?? undefined,
		pulledBy,
	});

// A board whose player was deleted has no player, so it is never left out. A bare `not` would leave it out too, since
// SQL compares null to nothing.
const notOwnedByFilter = (notOwnedBy: string | undefined) =>
	notOwnedBy === undefined ? {} : { OR: [{ playerId: null }, { playerId: { not: notOwnedBy } }] };

// The opponent boards are the player_board rows not consumed yet. Every change to them updates the round_board_count
// projection in the same transaction, so counting a round's boards reads one row.
@Injectable()
export class PrismaOpponentBoardStore extends OpponentBoardStore {
	constructor(
		private readonly prisma: PrismaService,
		private readonly random: RandomProvider,
	) {
		super();
	}

	async add({ id, board, performance, playerId, pulledBy }: PlayerBoard) {
		await this.prisma.$transaction([
			this.prisma.playerBoard.create({
				data: {
					id,
					round: board.round,
					board,
					wins: performance.wins,
					losses: performance.losses,
					playerId,
					pulledBy: [...pulledBy],
				},
			}),
			this.prisma.roundBoardCount.upsert({
				where: { round: board.round },
				create: { round: board.round, count: 1 },
				update: { count: { increment: 1 } },
			}),
		]);
	}

	async count(round: number) {
		const row = await this.prisma.roundBoardCount.findUnique({ where: { round } });
		return row?.count ?? 0;
	}

	// Counts the round's available boards on the (round, pulled_at) index, then reads only the one at a random offset.
	// A round holds about ROUND_POOL_SIZE available boards, so the offset stays short.
	async pickOne(round: number, notOwnedBy?: string) {
		const where = { round, pulledAt: null, ...notOwnedByFilter(notOwnedBy) };
		const count = await this.prisma.playerBoard.count({ where });
		if (count === 0) return undefined;
		const pick = (skip: number) => this.prisma.playerBoard.findFirst({ where, orderBy: { createdAt: "asc" }, skip });
		// A concurrent pull may have consumed boards since the count: then take the first one left.
		const row = (await pick(Math.floor(this.random.next() * count))) ?? (await pick(0));
		return row ? toPlayerBoard(row) : undefined;
	}

	// Also records the puller of a board a concurrent pull consumed since it was found.
	async markPulled(id: string, pulledBy: string) {
		await this.prisma.playerBoard.updateMany({ where: { id }, data: { pulledBy: { push: pulledBy } } });
	}

	// Concurrent pulls can pick the same board: only the first consumes it and counts it out of its round, but every one
	// records its puller.
	async remove(id: string, pulledBy: string) {
		await this.prisma.$transaction(async (transaction) => {
			const [consumed] = await transaction.playerBoard.updateManyAndReturn({
				where: { id, pulledAt: null },
				data: { pulledAt: new Date(), pulledBy: { push: pulledBy } },
				select: { round: true },
			});
			if (consumed) {
				await transaction.roundBoardCount.update({
					where: { round: consumed.round },
					data: { count: { decrement: 1 } },
				});
			} else {
				await transaction.playerBoard.updateMany({ where: { id }, data: { pulledBy: { push: pulledBy } } });
			}
		});
	}
}
