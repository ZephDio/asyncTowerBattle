import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Derive } from "@ddd-ts/traits";
import { Choupisson } from "../../recruit/implementation/choupisson";
import { BattleSpine } from "../../../projectile/battle/implementation/battle-spine";
import { Spine } from "../../../projectile/blueprint/implementation/spine";
import { TBattleUnit } from "../battle-unit";
import {
	DescriptionLine,
	ProjectileUnitDescription,
	TLiveDescriptionText,
} from "../../../../shared/traits/render/huds/item-descriptor";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class BattleChoupisson extends Derive(TBattleUnit, TLiveDescriptionText) {
	override idleSheet = UnitResources.choupissonSheet;
	pathFinder: PathFinder;

	constructor(
		recruit: Choupisson,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	// The spines' damage in the description follows the live projectile damage.
	liveDescription(): DescriptionLine[] {
		if (!(this.description instanceof ProjectileUnitDescription)) return this.description.description;
		return this.description.liveDescription(this.stats.projectileDamage);
	}

	override takeHit(damage: number) {
		const { below, left, right } = this.hooks.gridHooks.getRelativeDirection();
		left.x = left.x * 0.25;
		right.x = right.x * 0.25;
		const vectorLeft = below.add(left);
		const vectorRight = below.add(right);
		const spines = [
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.projectileDamage, below),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.projectileDamage, vectorLeft),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.projectileDamage, vectorRight),
		];
		spines.forEach((spine) => this.hooks.addProjectile(spine, this));
		this.stats.takeDamage(damage);
	}
}
