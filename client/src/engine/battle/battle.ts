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
import { ScreenPosition } from "../../shared/position";
import { HudTooltip } from "../../shared/hud-element/battle/army-resume/hud-tooltip";
import { secondsToFrame } from "../../shared/seconds";
import { TranslateAnimation } from "../translate-animation/translate-animation";

export class Battle {
	battlefield: Battlefield;
	isOver = false;

	animationOver = false;
	// Set once the intro animations end and the tick loop runs.
	started = false;
	// Stops the tick loop so the debug bridge can step the battle itself.
	paused = false;
	gameSpeed = secondsToFrame(1);
	battleClock: BattleClockHud;
	speedCursor: SliderBattleSpeed;
	alliedArmyResume: ArmyResume;
	enemyArmyResume: ArmyResume;
	// The last mouse position over the banners' buffs or Fury, hit-tested again every frame as buffs come and go.
	hoverPoint: ScreenPosition | null = null;

	timer = { clock: 0 };

	constructor(
		public alliedArmy: Army,
		public enemyArmy: Army,
		public randomSeed: BattleRandomSeed,
		public onBattleOver: Game["handleEndBattle"],
		public setDescriptionHud: Game["setDescriptionHud"],
		// The names shown above each castle's health.
		public playerNames: { allied: string; enemy: string },
	) {
		this.battlefield = new Battlefield(
			this.alliedArmy,
			this.enemyArmy,
			this.handleBattleOver.bind(this),
			() => this.randomSeed.random(),
			this.timer,
		);
		this.battleClock = new BattleClockHud(this.timer);
		this.speedCursor = new SliderBattleSpeed(PercentToReal({ x: 10, y: 96 }), this.changeSpeed.bind(this));
		this.alliedArmyResume = new ArmyResume(
			this.battlefield.alliedArmy,
			PercentToReal({ x: 11, y: 32 }),
			playerNames.allied,
		);
		this.enemyArmyResume = new ArmyResume(
			this.battlefield.enemyArmy,
			PercentToReal({ x: 89, y: 32 }),
			playerNames.enemy,
		);
	}

	init() {
		const armyGridAnimation = new TranslateAnimation(
			20,
			this.alliedArmy.grid.centerPosition,
			PercentToReal({ x: 50, y: 25.5 }),
			this.alliedArmy.grid.centerPosition.clone(),
			() => {
				this.animationOver = true;
			},
			() => {
				this.alliedArmy.grid.updateCornerPosition();
			},
		);
		const alliedArmyResumeAnimation = new TranslateAnimation(
			20,
			this.alliedArmyResume.position,
			this.alliedArmyResume.position.clone(),
			PercentToReal({ x: -20, y: 32 }),
		);
		const enemyArmyResumeAnimation = new TranslateAnimation(
			20,
			this.enemyArmyResume.position,
			this.enemyArmyResume.position.clone(),
			PercentToReal({ x: 120, y: 32 }),
			this.start.bind(this),
		);
		armyGridAnimation.startAnimation();
		alliedArmyResumeAnimation.startAnimation();
		enemyArmyResumeAnimation.startAnimation();
	}

	start() {
		this.battlefield.triggerBattleStartEffects();
		this.started = true;
		const loop = () => {
			setTimeout(() => {
				if (this.gameSpeed === 0 || this.paused) {
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

	handleBattleOver(battleVerdict: "Victory" | "Defeat") {
		this.isOver = true;
		this.hoverPoint = null;
		this.onBattleOver(battleVerdict, this);
	}

	// Whether the point is over a banner buff or Fury. The banners only take hovers once their intro slide is over.
	hoverBanners(point: ScreenPosition) {
		this.hoverPoint = this.started && this.tooltipAt(point) ? point : null;
		return this.hoverPoint !== null;
	}

	tooltipAt(point: ScreenPosition): HudTooltip | null {
		return this.alliedArmyResume.tooltipAt(point) ?? this.enemyArmyResume.tooltipAt(point);
	}

	changeSpeed(speed: number) {
		if (speed === 0) {
			this.gameSpeed = 0;
			return;
		}
		this.gameSpeed = 31.25 / speed;
	}

	getDrawables(): RenderableState {
		const tooltip = this.hoverPoint ? this.tooltipAt(this.hoverPoint) : null;
		return {
			renderables: [
				this.battleClock,
				this.speedCursor,
				this.alliedArmyResume,
				this.enemyArmyResume,
				...(tooltip ? [tooltip] : []),
			],
			grids: this.animationOver
				? [
						{
							grid: this.battlefield.grid,
							drawables: [
								...this.battlefield.alliedArmy.areaEffects.keys(),
								...this.battlefield.enemyArmy.areaEffects.keys(),
								...this.battlefield.units,
								...this.battlefield.projectiles,
							],
						},
					]
				: [
						{
							grid: this.alliedArmy.grid,
							drawables: [],
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
