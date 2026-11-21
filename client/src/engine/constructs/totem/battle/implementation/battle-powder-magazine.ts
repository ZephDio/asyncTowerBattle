import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { PowderMagazine } from "../../recruit/implementation/powder-magazine";
import { secondsToFrame } from "../../../../../shared/seconds";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class BattlePowderMagazine extends Derive(BattleTotem, BattleStartTrigger) {
	triggered = false;

	constructor(
		public powderMagazine: PowderMagazine,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override orientation: BoardOrientation,
	) {
		super({
			tagHolder: powderMagazine,
			rarityHolder: powderMagazine,
			imageDrawable: powderMagazine,
			hitboxHolder: powderMagazine,
			battleStartRecruit: powderMagazine,
			descriptor: powderMagazine,
		});
		this.gridShape = powderMagazine.gridShape;
	}

	onBattleStart() {
		this.hooks.alliedArmyBuffHooks.addTowerBuff("projectile-damage", this.powderMagazine.blueprint.startDamageStacks);
	}

	onTrigger() {
		this.hooks.alliedArmyBuffHooks.addTowerBuff("cast-speed", this.powderMagazine.blueprint.lateCastSpeedStacks);
	}

	tick() {
		const timer = this.hooks.timer().clock;
		if (timer > secondsToFrame(this.powderMagazine.blueprint.lateTriggerSeconds) && !this.triggered) {
			this.onTrigger();
			this.triggered = true;
		}
	}
}
