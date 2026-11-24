import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service.js";
import { CurrentGameStore } from "../../applicative/interfaces/current-game.store.js";
import { CurrentGame, type SavedGame } from "../../domain/current-game.js";

@Injectable()
export class PrismaCurrentGameStore extends CurrentGameStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async save({ playerId, game: savedGame }: CurrentGame) {
		// Plain JSON for Prisma's JSON input type, which the open fields of a saved piece don't satisfy.
		const game = JSON.parse(JSON.stringify(savedGame));
		await this.prisma.currentGame.upsert({
			where: { playerId },
			create: { playerId, game },
			update: { game },
		});
	}

	async find(playerId: string) {
		const row = await this.prisma.currentGame.findUnique({ where: { playerId } });
		return row ? new CurrentGame({ playerId, game: row.game as unknown as SavedGame }) : undefined;
	}

	async delete(playerId: string) {
		await this.prisma.currentGame.deleteMany({ where: { playerId } });
	}
}
