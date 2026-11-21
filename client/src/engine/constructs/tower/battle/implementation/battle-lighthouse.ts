import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTower } from "../battle-tower";
import { BoardOrientation, orientCell } from "../../../../../shared/traits/engine/core/board-orientation";
import { Lighthouse } from "../../recruit/implementation/lighthouse";
import { LIGHTHOUSE_BEAMS, LighthouseSide } from "../../blueprint/implementation/lighthouse-blueprint";
import { LighthouseBeam } from "../../../../area-effect/implementation/lighthouse-beam";

export class BattleLighthouse extends Derive(BattleTower) {
	// The pair of sides the next cast lights, an index in the blueprint's beamPairs.
	private nextPair = 0;
	// The enemy hits of this lighthouse's beams during the battle. A beam hits a unit at most once, but every beam that
	// hits it counts: the same unit lit by two casts counts twice.
	private hits = 0;

	constructor(
		private readonly recruit: Lighthouse,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => {},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
	}

	get enemiesHit() {
		return this.hits;
	}

	// The battle cells of one side's beam, in sweep order. The mirrored lighthouse of the opponent lights the point
	// mirrored cells, in the mirrored order, so its sweep stays clockwise on screen too.
	beamCells(side: LighthouseSide) {
		return LIGHTHOUSE_BEAMS[side].map((relative) => orientCell(relative, this.orientation).add(this.cell));
	}

	// Every 10th enemy hit raises the army's tower projectile damage by one.
	private countHit() {
		this.hits++;
		if (this.hits % this.recruit.tower.enemiesPerBuff !== 0) return;
		this.hooks.alliedArmyBuffHooks.addTowerBuff("projectile-damage", 1);
	}

	// Where the beams start: the crystal floating above the tower (below it for the opponent's tower, drawn upside down).
	crystalPosition() {
		const above = this.orientation === BoardOrientation.Mirrored ? -1 : 1;
		return new GridPosition({ x: this.position.x, y: this.position.y + above * this.recruit.tower.crystalAbove });
	}

	private fire(side: LighthouseSide) {
		const { sweepTicks, fadeTicks } = this.recruit.tower;
		const beam = new LighthouseBeam(
			this.crystalPosition(),
			this.beamCells(side),
			this.stats.projectileDamage,
			sweepTicks,
			fadeTicks,
			this.hooks,
			this.countHit.bind(this),
		);
		this.hooks.addAreaEffect(beam, this);
	}

	// The cast never waits for a target: every cast lights its pair of sides, enemies there or not. Without the food
	// nothing is lit, and the same pair waits for the next cast.
	onCastResolve(): void {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const { beamPairs } = this.recruit.tower;
			for (const side of beamPairs[this.nextPair] ?? []) this.fire(side);
			this.nextPair = (this.nextPair + 1) % beamPairs.length;
		}
		this.finishCast(sucess);
	}
}
