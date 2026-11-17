import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { ElfBlueprint } from "../../blueprint/implementation/elf-blueprint";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArrow } from "../../../projectile/battle/implementation/battle-arrow";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class BattleElf extends Derive(TBattleUnit, Caster) {
	override idleSheet = UnitResources.elfSheet;
	pathFinder: PathFinder;
	constructor(
		public recruit: ElfBlueprint,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			casterRecruit: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	shootArrow() {
		const vector = this.hooks.gridHooks.getRelativeDirection().below;
		this.hooks.addProjectile(
			new BattleArrow(this.recruit.getProjectile(), this.position.clone(), this.hooks, 3, vector),
			this,
		);
		this.finishCast();
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.shootArrow.bind(this));
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
