import { Injectable } from "@nestjs/common";
import { PlayerStore } from "../applicative/interfaces/player.store.js";
import type { Player, PlayerAccount } from "../domain/player.js";

@Injectable()
export class InMemoryPlayerStore extends PlayerStore {
	private readonly players = new Map<string, PlayerAccount>();

	async create(account: PlayerAccount) {
		this.players.set(account.id, { ...account });
	}

	async findById(id: string) {
		const player = this.players.get(id);
		return player && this.toPlayer(player);
	}

	async findByGoogleId(googleId: string) {
		const player = [...this.players.values()].find((stored) => stored.googleId === googleId);
		return player && this.toPlayer(player);
	}

	private toPlayer({ id, email, name }: PlayerAccount): Player {
		return { id, email, name };
	}
}
