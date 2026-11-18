import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import type { PlayerBoard as PlayerBoardRow } from "../../database/generated/prisma/client.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import type { CheckedBoard } from "../domain/checked-board.js";
import type { PlayerBoard } from "../domain/player-board.js";

// Only checked boards are stored, and the player_board_board_check constraint refuses any other.
const toPlayerBoard = ({ id, board, wins, losses, playerId }: PlayerBoardRow): PlayerBoard => ({
	id,
	board: board as CheckedBoard,
	performance: { wins, losses },
	...(playerId && { playerId }),
});

// A guest's board and the seed boards have no player, so they are never left out. A bare `not` would leave them out
// too, since SQL compares null to nothing.
const notOwnedByFilter = (notOwnedBy: string | undefined) =>
	notOwnedBy === undefined ? {} : { OR: [{ playerId: null }, { playerId: { not: notOwnedBy } }] };

// The opponent boards are the player_board rows not pulled yet.
@Injectable()
export class PrismaOpponentBoardStore extends OpponentBoardStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async add({ id, board, performance, playerId }: PlayerBoard) {
		await this.prisma.playerBoard.create({
			data: { id, round: board.round, board, wins: performance.wins, losses: performance.losses, playerId },
		});
	}

	async findByRound(round: number, notOwnedBy?: string) {
		const rows = await this.prisma.playerBoard.findMany({
			where: { round, pulledAt: null, ...notOwnedByFilter(notOwnedBy) },
			orderBy: { createdAt: "asc" },
		});
		return rows.map(toPlayerBoard);
	}

	async remove(id: string, pulledBy: string) {
		await this.prisma.playerBoard.updateMany({
			where: { id, pulledAt: null },
			data: { pulledAt: new Date(), pulledBy },
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
