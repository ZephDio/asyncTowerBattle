import { BattleState } from "../../shared/gamestate";
import { Army } from "../army/entity/army";
import { BattleVerdict } from "../battle-summary/battle-summary";
import { Game } from "../game";
import { Battlefield } from "./battlefield/battlefield";

export class Battle {
	battlefield: Battlefield;
	isOver = false;

	constructor(
		public alliedArmy: Army,
		public enemyArmy: Army,
		public onBattleOver: Game["handleEndBattle"],
	) {
		this.battlefield = new Battlefield(this.alliedArmy, this.enemyArmy, this.handleBattleOver.bind(this));
	}

	start() {
		const loop = () => {
			setTimeout(() => {
				if (this.isOver) return;
				this.tick();
				loop();
			}, 30);
		};
		loop();
	}

	tick() {
		this.battlefield.tick();
	}

	handleBattleOver(battleVerdict: BattleVerdict) {
		// could be nice to build summary here
		this.isOver = true;
		this.onBattleOver(battleVerdict);
	}

	getState(): BattleState {
		const battleState: BattleState = {
			type: "battle",
			castles: [this.battlefield.alliedArmy.castle, this.battlefield.enemyArmy.castle].map((castle) =>
				castle.toSerialized(),
			),
			towers: [...this.battlefield.alliedArmy.towers, ...this.battlefield.enemyArmy.towers].map((tower) =>
				tower.toSerialized(this.battlefield.grid),
			),
			paths: [this.battlefield.alliedArmy.path, this.battlefield.enemyArmy.path],
			entities: [...this.battlefield.units],
			projectiles: [...this.battlefield.projectiles],
			areaEffects: [...this.battlefield.areaEffects],
			grid: this.battlefield.grid.toSerialized(),
		};
		return battleState;
	}
}
