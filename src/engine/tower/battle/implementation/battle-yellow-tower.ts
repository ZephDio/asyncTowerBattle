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
	) {
		super({
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			castSpeed: recruit.attackSpeed,
			onDeath: () => {},
			hitboxHolder: recruit,
		});
	}

	private attack() {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.cell, [
			new Cell({ x: 1, y: 0 }),
			new Cell({ x: -1, y: 0 }),
			new Cell({ x: 0, y: 1 }),
			new Cell({ x: 0, y: -1 }),
		]);

		for (const neighbor of neighbors) {
			if (neighbor instanceof BasicBattlePathTile || neighbor instanceof SlowingBattlePathTile) {
				const position = this.hooks.gridHooks.getRealPosition(neighbor.cell);
				const areaEffects = this.recruit.getAreaEffect(this.hooks, position, this.stats.attack);
				this.hooks.addAreaEffect(areaEffects, this);
			}
		}
		this.castInProgress = null;
	}

	isAlive() {
		return true;
	}

	onCastResolve(): void {
		this.attack();
		this.castInProgress = null;
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
