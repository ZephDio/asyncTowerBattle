import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattleGobelin } from "../../battle/implementation/battle-gobelin";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class GobelinBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(Resources.unit.gobelin.resource.image, Resources.unit.gobelin.size, 3),
	TDamageDealer(1),
	FoodConsumer,
) {
	override description = new Description("Gobelin", ["A small and fast creature"]);
	baseMaxLife = 10;
	baseSpeed = 0.4;
	attackSpeed = 4;

	foodCost = 1;

	cost = 10;

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleGobelin(this, gridPosition, enemyPath, hooks);
	}
}
