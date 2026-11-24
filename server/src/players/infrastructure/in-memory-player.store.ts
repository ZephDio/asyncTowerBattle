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
		return this.find((stored) => stored.googleId === googleId);
	}

	async findByEmail(email: string) {
		return this.find((stored) => stored.email === email);
	}

	async findByName(name: string) {
		return this.find((stored) => stored.name.toLowerCase() === name.toLowerCase());
	}

	async findPasswordLogin(email: string) {
		const player = [...this.players.values()].find((stored) => stored.email === email);
		return player?.passwordHash ? { player: this.toPlayer(player), passwordHash: player.passwordHash } : undefined;
	}

	async findPasswordLoginByName(name: string) {
		const player = [...this.players.values()].find((stored) => stored.name.toLowerCase() === name.toLowerCase());
		return player?.passwordHash ? { player: this.toPlayer(player), passwordHash: player.passwordHash } : undefined;
	}

	private find(matches: (stored: PlayerAccount) => boolean) {
		const player = [...this.players.values()].find(matches);
		return player && this.toPlayer(player);
	}

	private toPlayer({ id, email, name }: PlayerAccount): Player {
		return { id, email, name };
	}
}
