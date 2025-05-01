import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { Derive } from "@ddd-ts/traits";
import { Choupisson } from "../../recruit/implementation/choupisson";
import { BattleSpine } from "../../../projectile/battle/implementation/battle-spine";
import { Spine } from "../../../projectile/blueprint/implementation/spine";
import { TBattleUnit } from "../battle-unit";

export class BattleChoupisson extends Derive(TBattleUnit) {
	pathFinder: PathFinder;

	constructor(
		recruit: Choupisson,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			attackSpeed: recruit.attackSpeed,
			castSpeed: recruit.attackSpeed,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	override takeHit(damage: number) {
		const { below, left, right } = this.hooks.gridHooks.getRelativeDirection();
		left.x = left.x * 0.25;
		right.x = right.x * 0.25;
		const vectorLeft = below.add(left);
		const vectorRight = below.add(right);
		const spines = [
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 3, below),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 3, vectorLeft),
			new BattleSpine(new Spine(), this.position.clone(), this.hooks, this.stats.attack * 3, vectorRight),
		];
		spines.forEach((spine) => this.hooks.addProjectile(spine, this));
		this.stats.takeDamage(damage);
	}
}
