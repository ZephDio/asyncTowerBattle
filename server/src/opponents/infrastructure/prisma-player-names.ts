import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { PlayerNames } from "../applicative/interfaces/player-names.js";

@Injectable()
export class PrismaPlayerNames extends PlayerNames {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async find(playerId: string) {
		const row = await this.prisma.player.findUnique({ where: { id: playerId }, select: { name: true } });
		return row?.name;
	}
}
