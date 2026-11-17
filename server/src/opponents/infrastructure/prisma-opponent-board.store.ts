import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import type { PlayerBoard as PlayerBoardRow } from "../../generated/prisma/client.js";
import { OpponentBoardStore, type StoredPlayerBoard } from "../applicative/interfaces/opponent-board.store.js";
import type { PlayerBoard } from "../domain/player-board.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

const toStoredPlayerBoard = ({ id, board, wins, losses }: PlayerBoardRow): StoredPlayerBoard => ({
	id,
	board: board as SerializedBoard,
	performance: { wins, losses },
});

// The opponent boards are the player_board rows not pulled yet.
@Injectable()
export class PrismaOpponentBoardStore extends OpponentBoardStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async add({ board, performance }: PlayerBoard) {
		await this.prisma.playerBoard.create({
			data: { round: board.round, board, wins: performance.wins, losses: performance.losses },
		});
	}

	async findByRound(round: number) {
		const rows = await this.prisma.playerBoard.findMany({
			where: { round, pulledAt: null },
			orderBy: { createdAt: "asc" },
		});
		return rows.map(toStoredPlayerBoard);
	}

	async remove(id: string) {
		await this.prisma.playerBoard.updateMany({ where: { id, pulledAt: null }, data: { pulledAt: new Date() } });
	}

	async rounds() {
		const rows = await this.prisma.playerBoard.findMany({
			where: { pulledAt: null },
			distinct: ["round"],
			select: { round: true },
		});
		return rows.map(({ round }) => round);
	}
}
