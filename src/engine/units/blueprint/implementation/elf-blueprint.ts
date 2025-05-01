import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TDamageDealer } from "../../../../shared/traits/engine/damage-dealer";
import { TDrawable } from "../../../../shared/traits/render/drawable";
import { TDescriptor, UnitDescription } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";
import { seconds } from "../../../../shared/seconds";
import { BattleElf } from "../../battle/implementation/battle-elf";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { Arrow } from "../../../projectile/blueprint/implementation/arrow";

export class ElfBlueprint extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new GridPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TDescriptor,
	TImageDrawable(Resources.unit.elf.resource.image, Resources.unit.elf.size, DrawPriority.NormalGridElement),
	TDamageDealer(1),
	FoodConsumer,
	TokenUnit,
	RecruitCaster,
) {
	baseMaxLife = 10;
	baseSpeed = 0.32;
	attackSpeed = 5;
	castSpeed = 5;

	foodCost = 0.4;
	cost = seconds(1.2);

	description = new UnitDescription("Elf", ["A lame unit", "that doesn't do", "anything special"], {
		health: "6",
		damage: "1",
		"move speed": "0.32",
		"food consumption": "0.6",
		"production time": "1.2s",
	});
	toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks) {
		return new BattleElf(this, gridPosition, enemyPath, hooks);
	}

	getProjectile() {
		return new Arrow();
	}
}
