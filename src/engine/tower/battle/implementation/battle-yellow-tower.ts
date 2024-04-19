import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TCasterHudRenderable } from "../../../../shared/traits/render/huds/caster-camembert-renderable";
import { YellowTower } from "../../recruit/implementation/yellow-tower-recruit";
import { HaveStats, Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/engine/status";
import { SlowingBattlePathTile } from "../../../tile/battle/implementation/slowing-battle-tile";
import { BasicBattlePathTile } from "../../../tile/battle/implementation/basic-battle-tile";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";

export class YellowBattleTower extends Derive(
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	GridElement,
	HaveStats,
) {
	constructor(
		private readonly recruit: YellowTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,

		public override orientation: number,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			attackSpeed: NaN,
			onDeath: () => {},
			foodCost: recruit.foodCost,
			hitboxHolder: recruit,
		});
		this.angle = this.orientation;
		this.gridShape = recruit.gridShape;
	}

	private attack() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.recruit.patternEffect.getRelativeCells(this.recruit.orientation),
		);
		let sucess: boolean = false;
		if (
			neighbors.some((neighbor) => neighbor instanceof BasicBattlePathTile || neighbor instanceof SlowingBattlePathTile)
		) {
			sucess = this.hooks.alliedFoodHooks.consumeFood(this.recruit.foodCost);
			if (sucess) {
				for (const neighbor of neighbors) {
					if (neighbor instanceof BasicBattlePathTile || neighbor instanceof SlowingBattlePathTile) {
						const position = this.hooks.gridHooks.getRealPosition(neighbor.cell);
						const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.stats.attack);
						this.hooks.addAreaEffect(areaEffects, this);
					}
				}
			}
		}
		this.finishCast(sucess);
	}

	isAlive() {
		return true;
	}

	onCastResolve(): void {
		this.attack();
		this.finishCast();
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
	}

	tick() {
		this.tickCast();
		this.stats.tick();
	}
}

export class Poisoned extends Derive(Status) {
	key = "poisoned";
	clock = 0;
	duration = 70;
	stats: Stats;

	constructor(public damage: number) {
		super({});
	}

	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.onRemove();
		}
		this.stats.takeDamage(this.damage / 64);
	}

	onRemove() {
		this.stats.removeStatus(this);
	}
}
