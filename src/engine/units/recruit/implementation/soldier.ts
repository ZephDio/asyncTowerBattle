// import { Derive } from "@ddd-ts/traits";
// import { Cell, GridPosition } from "../../../../shared/position";
// import { BattleArmyHooks } from "../../../army/battle/battle-army";
// import { BattlePath } from "../../../path/battle/battle-path";
// import { BattleSoldier } from "../../battle/implementation/battle-soldier";
// import { SoldierBlueprint } from "../../blueprint/implementation/soldier-blueprint";
// import { Unit } from "../unit";
// import { HTDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
// export class Soldier extends Derive(Unit, HTDamageDealer) {
// 	speed: number;
// 	maxLife: number;
// 	attackSpeed: number;
// 	cost: number;
// 	constructor(
// 		public cell: Cell,
// 		soldier: SoldierBlueprint = new SoldierBlueprint({}),
// 	) {
// 		super({
// 			imageDrawable: soldier,
// 			damageDealer: soldier,
// 			hitboxHolder: soldier,
// 			descriptor: soldier,
// 			foodConsumer: soldier,
// 		});
// 		this.maxLife = soldier.baseMaxLife;
// 		this.speed = soldier.baseSpeed;
// 		this.attackSpeed = soldier.attackSpeed;
// 		this.cost = soldier.cost;
// 	}

// 	get position() {
// 		return this.cell;
// 	}

// 	toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks) {
// 		return new BattleSoldier(this, position, path, hooks);
// 	}
// }
