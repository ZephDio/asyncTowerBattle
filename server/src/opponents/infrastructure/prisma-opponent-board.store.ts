import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import type { PlayerBoard as PlayerBoardRow } from "../../database/generated/prisma/client.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import type { CheckedBoard } from "../domain/checked-board.js";
import type { PlayerBoard } from "../domain/player-board.js";

// Only checked boards are stored, and the player_board_board_check constraint refuses any other.
const toPlayerBoard = ({ id, board, wins, losses, playerId, bot, pulledBy }: PlayerBoardRow): PlayerBoard => ({
	id,
	board: board as CheckedBoard,
	performance: { wins, losses },
	...(playerId && { playerId }),
	bot,
	pulledBy,
});

// A guest's board and the seed boards have no player, so they are never left out. A bare `not` would leave them out
// too, since SQL compares null to nothing.
const notOwnedByFilter = (notOwnedBy: string | undefined) =>
	notOwnedBy === undefined ? {} : { OR: [{ playerId: null }, { playerId: { not: notOwnedBy } }] };

// The opponent boards are the player_board rows not consumed yet. Every change to them updates the round_board_count
// projection in the same transaction, so counting a round's boards reads one row.
@Injectable()
export class PrismaOpponentBoardStore extends OpponentBoardStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async add({ id, board, performance, playerId, bot, pulledBy }: PlayerBoard) {
		await this.prisma.$transaction([
			this.prisma.playerBoard.create({
				data: {
					id,
					round: board.round,
					board,
					wins: performance.wins,
					losses: performance.losses,
					playerId,
					bot,
					pulledBy,
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

	async findByRound(round: number, notOwnedBy?: string) {
		const rows = await this.prisma.playerBoard.findMany({
			where: { round, pulledAt: null, ...notOwnedByFilter(notOwnedBy) },
			orderBy: { createdAt: "asc" },
		});
		return rows.map(toPlayerBoard);
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

	async rounds(notOwnedBy?: string) {
		const rows = await this.prisma.playerBoard.findMany({
			where: { pulledAt: null, ...notOwnedByFilter(notOwnedBy) },
			distinct: ["round"],
			select: { round: true },
		});
		return rows.map(({ round }) => round);
	}
}
