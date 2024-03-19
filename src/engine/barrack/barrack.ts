import { Position } from "../../shared/position";
import { Battle } from "../battle/battle";
import { Physic } from "../physic/physic";
import { SoldierEntityUnitPhysic } from "../physic/units/entity-units-physic";
import { SoldierEntityUnit, Unit } from "../units/domain/units";

export class UnitProduction<U extends Unit> {
    progress = 0
    constructor(public barrack: Barrack, public resolve: Function) { }

    tick() {
        this.progress += this.barrack.productionSpeed
        console.log({ progress: this.progress })
        if (this.progress >= 100) {
            this.resolve()
        }
    }
}

export class Barrack {
    onGoingProduction = null as null | UnitProduction<Unit>
    constructor(public productionSpeed: number,
        public position: Position,
        private battle: Battle,
        public soldierEntityUnit: SoldierEntityUnit) { }

    tick() {
        if (this.onGoingProduction) {
            this.onGoingProduction.tick()
        }
        if (!this.onGoingProduction) {
            this.onGoingProduction = new UnitProduction(this, () => {
                this.produce()
                this.onGoingProduction = null
            })
        }
    }

    produce() {
        console.log('produce')
        this.battle.physics.units.push(new SoldierEntityUnitPhysic(this.soldierEntityUnit, this.position, this.battle.playerArmy.path))
    }
}
