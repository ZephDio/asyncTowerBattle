import { Injectable } from "@nestjs/common";
import { PlayerNames } from "../applicative/interfaces/player-names.js";

// For the tests: the names by player id.
@Injectable()
export class InMemoryPlayerNames extends PlayerNames {
	constructor(private readonly names: Record<string, string> = {}) {
		super();
	}

	async find(playerId: string) {
		return this.names[playerId];
	}
}
