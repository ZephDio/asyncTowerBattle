// import { Derive } from "@ddd-ts/traits";
// import { Cell, GridPosition } from "../../../../shared/position";
// import { BattleArmyHooks } from "../../../army/battle/battle-army";
// import { BattlePath } from "../../../path/battle/battle-path";
// import { Unit } from "../unit-recruit";
// import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
// import { GobelinBlueprint } from "../../blueprint/implementation/gobelin";
// import { BattleGobelin } from "../../battle/implementation/battle-gobelin";
// export class Gobelin extends Derive(HTDamageDealer, Unit) {
// 	speed: number;
// 	maxLife: number;
// 	attackSpeed: number;
// 	cost: number;
// 	constructor(
// 		public cell: Cell,
// 		gobelin: GobelinBlueprint = new GobelinBlueprint({}),
// 	) {
// 		super({ imageDrawable: gobelin, damageDealer: gobelin, hitboxHolder: gobelin, descriptor: gobelin});
// 		this.maxLife = gobelin.baseMaxLife;
// 		this.speed = gobelin.baseSpeed;
// 		this.attackSpeed = gobelin.attackSpeed;
// 		this.cost = gobelin.cost;
// 	}

// 	get position() {
// 		return this.cell;
// 	}
// 	type = "dragon" as const;

// 	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
// 		return new BattleGobelin(this, position, path, hooks);
// 	}
// }
