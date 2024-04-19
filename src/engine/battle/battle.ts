import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { RenderableState } from "../../renderer/renderer";
import { BattleState } from "../../shared/gamestate";
import { FoodBarHud } from "../../shared/hud-element/army-food-bar";
import { BattleClockHud } from "../../shared/hud-element/battle/battle-clock";
import { ButtonSpeedHUD } from "../../shared/hud-element/battle/button-speed";
import { CastleLifeBar } from "../../shared/hud-element/battle/castle-life-bar";
import { Army } from "../army/army";
import { Game } from "../game";
import { BattleRandomSeed } from "./battle-random-seed";
import { Battlefield } from "./battlefield/battlefield";

export class Battle {
	battlefield: Battlefield;
	isOver = false;

	gameSpeed = 30;
	alliedCastleLifeBar: CastleLifeBar;
	enemyCastleLifeBar: CastleLifeBar;
	alliedFoodBar: FoodBarHud;
	enemyFoodBar: FoodBarHud;
	battleClock: BattleClockHud;

	timer = { clock: 0 };

	constructor(
		public alliedArmy: Army,
		public enemyArmy: Army,
		public randomSeed: BattleRandomSeed,
		public onBattleOver: Game["handleEndBattle"],
		public setDescriptionHud: Game["setDescriptionHud"],
	) {
		this.battlefield = new Battlefield(this.alliedArmy, this.enemyArmy, this.handleBattleOver.bind(this), () =>
			this.randomSeed.random(),
		);
		this.alliedCastleLifeBar = new CastleLifeBar(this.battlefield.alliedArmy.castle, true, this.battlefield.grid);
		this.enemyCastleLifeBar = new CastleLifeBar(this.battlefield.enemyArmy.castle, false, this.battlefield.grid);
		this.alliedFoodBar = new FoodBarHud(this.battlefield.alliedArmy.foodEconomy, PercentToReal({ x: 5, y: 50 }));
		this.enemyFoodBar = new FoodBarHud(this.battlefield.enemyArmy.foodEconomy, PercentToReal({ x: 95, y: 50 }));
		this.battleClock = new BattleClockHud(this.timer);
	}

	start() {
		const loop = () => {
			setTimeout(() => {
				if (this.isOver) return;
				this.tick();
				loop();
			}, this.gameSpeed);
		};
		loop();
	}

	tick() {
		this.timer.clock++;
		this.battlefield.tick();
	}

	handleBattleOver(battleVerdict: "victory" | "defeat") {
		// could be nice to build summary here
		this.isOver = true;
		this.onBattleOver(battleVerdict);
	}

	changeSpeed(speed: number) {
		this.gameSpeed = 30 / speed;
	}

	getDrawables(): RenderableState {
		return {
			renderables: [
				new ButtonSpeedHUD(1, PercentToReal({ x: 3, y: 95 })),
				new ButtonSpeedHUD(2, PercentToReal({ x: 7.5, y: 95 })),
				new ButtonSpeedHUD(3, PercentToReal({ x: 12, y: 95 })),
				this.alliedCastleLifeBar,
				this.enemyCastleLifeBar,
				this.alliedFoodBar,
				this.enemyFoodBar,
				this.battleClock,
			],
			grids: [
				{
					grid: this.battlefield.grid,
					drawables: [
						...this.battlefield.alliedArmy.areaEffects.keys(),
						...this.battlefield.enemyArmy.areaEffects.keys(),
						...this.battlefield.units,
						...this.battlefield.projectiles,
					],
				},
			],
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
			hudElements: [
				new ButtonSpeedHUD(1, PercentToReal({ x: 3, y: 95 })),
				new ButtonSpeedHUD(2, PercentToReal({ x: 7.5, y: 95 })),
				new ButtonSpeedHUD(3, PercentToReal({ x: 12, y: 95 })),
				this.alliedCastleLifeBar,
				this.enemyCastleLifeBar,
				this.battleClock,
			],
		};
		return battleState;
	}
}
