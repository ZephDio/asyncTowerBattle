import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Unit } from "../unit";
import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { EntBlueprint } from "../../blueprint/implementation/ent-blueprint";
import { ForestTag } from "../../../../shared/traits/engine/tags/biome/biome-tags";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleEnt } from "../../battle/implementation/battle-ent";

export class Ent extends Derive(HTDamageDealer, Unit, ForestTag, RecruitCaster) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		public cell: Cell,
		blueprint: EntBlueprint = new EntBlueprint({}),
	) {
		super({
			imageDrawable: blueprint,
			damageDealer: blueprint,
			hitboxHolder: blueprint,
			descriptor: blueprint,
			foodConsumer: blueprint,
		});
		this.maxLife = blueprint.baseMaxLife;
		this.speed = blueprint.baseSpeed;
		this.attackSpeed = blueprint.attackSpeed;
		this.cost = blueprint.cost;
	}

	get position() {
		return this.cell;
	}

	type = "ent" as const;

	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleEnt(this, position, path, hooks);
	}
}
