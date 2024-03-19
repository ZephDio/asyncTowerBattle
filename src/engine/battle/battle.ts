import { Army } from "../army/army";
import { Barrack } from "../barrack/barrack";
import { Physics } from "../physic/physics";
import { EntityUnitPhysic } from "../physic/units/entity-units-physic";
import { UnitEntityFixture } from "../units/domain/units";


export class Battle {
    alliedArmy: Army
    enemyArmy: Army
    physics: Physics
    constructor(alliedArmy: Army, enemyArmy: Army) {
        this.alliedArmy = this.cloneArmy(alliedArmy)
        this.enemyArmy = this.cloneArmy(enemyArmy)
        this.physics = new Physics(this.alliedArmy, this.enemyArmy)
    }


    start() {
        const barrack = new Barrack(2, 'enemy', this.enemyArmy.castle.position, this, UnitEntityFixture.soldier)
        const obama = new Barrack(2, 'allied', this.alliedArmy.castle.position, this, UnitEntityFixture.soldier)
        const loop = () => {
            setTimeout(() => {
                this.tick();
                barrack.tick()
                obama.tick()
                loop();
            }, 31);
        };
        loop();
    }

    cloneArmy(alliedArmy: Army) {
        return new Army(
            alliedArmy.castle.clone(),
            alliedArmy.towers.map((tower) => tower.clone()),
            alliedArmy.path,
            []
        )
    }

    tick() {
        this.physics.tick()
    }
}