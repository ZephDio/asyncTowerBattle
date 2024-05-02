import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleTotem } from "../battle-totem";
import { PowderMagazine } from "../../recruit/implementation/powder-magazine";
import { seconds } from "../../../../shared/seconds";
import { BattleStartTrigger } from "../../../../shared/traits/engine/battle-start";

export class BattlePowderMagazine extends Derive(BattleTotem, BattleStartTrigger) {
	vitalityBuffAmount: number = 2;
    triggered = false;

	constructor(
		public powderMagazine: PowderMagazine,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({
			imageDrawable: powderMagazine,
			hitboxHolder: powderMagazine,
			battleStartRecruit: powderMagazine
		});
		this.gridShape = powderMagazine.gridShape;
	}


    onBattleStart() {
        const rand = this.hooks.random();
        if(rand < 0.5) {
            this.hooks.alliedArmyBuffHooks.addTowerBuff("attack", 4);
            return
        }
        this.hooks.alliedArmyBuffHooks.addTowerBuff("cast-speed", 4);
       
    }

    onTrigger(){
        const rand = this.hooks.random();
        if(rand < 0.5) {
            this.hooks.alliedArmyBuffHooks.addTowerBuff("attack", 8);
            return
        }
        this.hooks.alliedArmyBuffHooks.addTowerBuff("cast-speed", 8);
    }

	tick() {
        const timer = this.hooks.timer().clock
        if(timer > seconds(15) && !this.triggered) {
		  this.onTrigger()
          this.triggered = true;
        }
	}
}
