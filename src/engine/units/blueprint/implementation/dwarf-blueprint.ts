import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { seconds } from "../../../../shared/seconds";
import { BattleDwarf } from "../../battle/implementation/battle-dwarf";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
export class DwarfBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 3, height: 3 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	RecruitCaster,
	TImageDrawable(Resources.unit.dwarf.resource.image, Resources.unit.dwarf.size, DrawPriority.NormalGridElement),
	TDamageDealer(1.2),
	FoodConsumer,
    TokenUnit
) {
	override description = new Description("Dwarf", ["Slow guy, but strong !"]);
	baseMaxLife = 14;
	baseSpeed = 0.13;
	attackSpeed = 4;
	foodCost = 0.4;

	cost = seconds(1.6);

	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleDwarf(this, gridPosition, enemyPath, hooks);
	}
}
