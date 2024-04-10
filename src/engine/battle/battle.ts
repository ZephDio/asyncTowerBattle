import { BattleState } from "../../shared/gamestate";
import { Army } from "../army/army";
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

	handleBattleOver(battleVerdict: "victory" | "defeat") {
		// could be nice to build summary here
		this.isOver = true;
		this.onBattleOver(battleVerdict);
	}

	getDrawables() {
		return {
			drawables: [
				...this.battlefield.alliedArmy.areaEffects.keys(),
				...this.battlefield.enemyArmy.areaEffects.keys(),
				...this.battlefield.units,
				...this.battlefield.projectiles,
			],
			grids: [this.battlefield.grid],
		};
	}

	getState(): BattleState {
		const battleState: BattleState = {
			type: "battle",
			castles: [this.battlefield.alliedArmy.castle, this.battlefield.enemyArmy.castle],
			towers: [...this.battlefield.alliedArmy.towers, ...this.battlefield.enemyArmy.towers],
			tiles: [...this.battlefield.alliedArmy.tiles, ...this.battlefield.enemyArmy.tiles],
			units: [...this.battlefield.units],
			projectiles: [...this.battlefield.projectiles],
			areaEffects: [...this.battlefield.areaEffects],
			grid: this.battlefield.grid,
			path: this.battlefield.alliedArmy.path,
		};
		return battleState;
	}
}
