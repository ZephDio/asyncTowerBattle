import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { FoodHooks } from "../../food/battle-food-economy";
import { Cast } from "../../../shared/traits/engine/cast";
import { ElfCastle } from "../recruit/implem/elf-castle";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TBattleCastle } from ".";

export class BattleElfCastle extends Derive(TBattleCastle) {
	public actualLife: number;
	public maxLife: number;
	public hooks: BattleArmyHooks;

	constructor(
		recruit: ElfCastle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		orientation: number,
		public foodHooks: FoodHooks,
	) {
		super({
			imageDrawable: recruit,
			hitboxHolder: recruit,
			casterRecruit: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => this.onDeath(),
			descriptor: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.setOrientation(orientation);
		console.log("2", { position });
	}

	initHooks(hooks: BattleArmyHooks) {
		this.hooks = hooks;
	}
	casts() {
		const cost = this.hooks.getDefaultUnit().stats.summonTime;
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), cost);
	}

	produceFood() {
		this.foodHooks.addFood(4 / 32);
	}

	onCastResolve() {
		this.hooks.addUnits(
			this.hooks.getDefaultUnit().toBattle(this.position.clone(), this.hooks.getEnemyPath(), this.hooks),
			this,
		);
		this.finishCast(true);
	}
}
