import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { RenderableState } from "../../renderer/renderer";
import { BattleState } from "../../shared/gamestate";
import { BattleClockHud } from "../../shared/hud-element/battle/battle-clock";
import { SliderBattleSpeed } from "../../shared/hud-element/battle/slider-speed";
import { Army } from "../army/army";
import { Game } from "../game";
import { BattleRandomSeed } from "./battle-random-seed";
import { Battlefield } from "./battlefield/battlefield";
import { ArmyResume } from "../../shared/hud-element/battle/army-resume/army-resume";

export class Battle {
	battlefield: Battlefield;
	isOver = false;

	gameSpeed = 31.25;
	battleClock: BattleClockHud;
	speedCursor: SliderBattleSpeed;
	alliedArmyResume: ArmyResume;
	enemyArmyResume: ArmyResume;

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
		this.battleClock = new BattleClockHud(this.timer);
		this.speedCursor = new SliderBattleSpeed(PercentToReal({ x: 10, y: 96 }), this.changeSpeed.bind(this));
		this.alliedArmyResume = new ArmyResume(this.battlefield.alliedArmy, PercentToReal({ x: 14, y: 32 }));
		this.enemyArmyResume = new ArmyResume(this.battlefield.enemyArmy, PercentToReal({ x: 86, y: 32 }));
	}

	start() {
		const loop = () => {
			setTimeout(() => {
				if (!this.gameSpeed) {
					loop();
					return;
				}
				if (this.isOver) return;
				this.tick();
				loop();
			}, this.gameSpeed ?? 31.25);
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
		if (speed === 0) {
			this.gameSpeed = 0;
			return;
		}
		this.gameSpeed = 31.25 / speed;
	}

	getDrawables(): RenderableState {
		return {
			renderables: [this.battleClock, this.speedCursor, this.alliedArmyResume, this.enemyArmyResume],
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
			hudElements: [this.battleClock, this.speedCursor],
		};
		return battleState;
	}
}
