import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service.js";
import { PlayerStepsStore } from "../../applicative/interfaces/player-steps.store.js";
import { PlayerSteps } from "../../domain/player-steps.js";

@Injectable()
export class PrismaPlayerStepsStore extends PlayerStepsStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async find(playerId: string) {
		const row = await this.prisma.playerSteps.findUnique({ where: { playerId } });
		return row ? new PlayerSteps(row) : PlayerSteps.none(playerId);
	}

	async save(steps: PlayerSteps) {
		const data = steps.toProps();
		await this.prisma.playerSteps.upsert({ where: { playerId: data.playerId }, create: data, update: data });
	}
}
