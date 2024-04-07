import { Derive } from "@ddd-ts/traits";
import { HTHitbox, TGCollider } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleDragon } from "../../battle/implementation/dragon-battle";
import { DragonBlueprint } from "../../blueprint/implementation/dragon";
import { Unit } from "../unit-recruit";
import { HTImageDrawable } from "../../../../shared/traits/drawable";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
import { GridElement } from "../../../grid/grid";

export class Dragon extends Derive(TGCollider, HTHitbox, HTDamageDealer, Unit, HTImageDrawable, GridElement) {
	speed: number;
	maxLife: number;
	attackSpeed: number;
	cost: number;
	constructor(
		dragon: DragonBlueprint,
		public cell: Cell,
	) {
		super({ imageDrawable: dragon, damageDealer: dragon, hitboxHolder: dragon });
		this.maxLife = dragon.baseMaxLife;
		this.speed = dragon.baseSpeed;
		this.attackSpeed = dragon.attackSpeed;
		this.cost = dragon.cost;
	}

	get position() {
		return this.cell;
	}
	type = "dragon" as const;

	toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDragon(this, position, path, hooks);
	}
}
