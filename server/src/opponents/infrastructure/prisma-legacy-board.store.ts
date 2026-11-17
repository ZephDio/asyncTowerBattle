import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { LegacyBoardStore } from "../applicative/interfaces/legacy-board.store.js";
import type { StoredPlayerBoard } from "../applicative/interfaces/opponent-board.store.js";

// The legacy boards are the pulled player_board rows. PrismaOpponentBoardStore.remove already marks a pulled board,
// so adding it here only writes the row when it isn't in the table yet.
@Injectable()
export class PrismaLegacyBoardStore extends LegacyBoardStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async add({ id, board, performance }: StoredPlayerBoard) {
		await this.prisma.playerBoard.upsert({
			where: { id },
			create: {
				id,
				round: board.round,
				board,
				wins: performance.wins,
				losses: performance.losses,
				pulledAt: new Date(),
			},
			update: {},
		});
	}
}
