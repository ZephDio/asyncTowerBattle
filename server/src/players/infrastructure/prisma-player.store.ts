import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import type { Player as PlayerRow } from "../../database/generated/prisma/client.js";
import { PlayerStore } from "../applicative/interfaces/player.store.js";
import type { Player, PlayerAccount } from "../domain/player.js";

const toPlayer = ({ id, email, name }: PlayerRow): Player => ({ id, email, name });

@Injectable()
export class PrismaPlayerStore extends PlayerStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async create(account: PlayerAccount) {
		await this.prisma.player.create({ data: account });
	}

	async findById(id: string) {
		const row = await this.prisma.player.findUnique({ where: { id } });
		return row ? toPlayer(row) : undefined;
	}

	async findByGoogleId(googleId: string) {
		const row = await this.prisma.player.findUnique({ where: { googleId } });
		return row ? toPlayer(row) : undefined;
	}
}
