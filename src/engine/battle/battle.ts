import { Army } from "../army/army";
import { Barrack } from "../barrack/barrack";
import { Physics } from "../physic/physics";
import { EntityUnitPhysic } from "../physic/units/entity-units-physic";
import { UnitEntityFixture } from "../units/domain/units";


export class Battle {
    playerArmy: Army
    enemyArmy: Army
    physics: Physics
    constructor(playerArmy: Army, enemyArmy: Army) {
        this.playerArmy = this.cloneArmy(playerArmy)
        this.enemyArmy = this.cloneArmy(enemyArmy)
        this.physics = new Physics(this.playerArmy, this.enemyArmy)
    }


    start() {
        const barrack = new Barrack(2, this.enemyArmy.castle.position, this, UnitEntityFixture.soldier)
        const loop = () => {
            setTimeout(() => {
                this.tick();
                barrack.tick()
                loop();
            }, 31);
        };
        loop();
    }

    cloneArmy(playerArmy: Army) {
        return new Army(
            playerArmy.castle.clone(),
            playerArmy.towers.map((tower) => tower.clone()),
            playerArmy.path,
            []
        )
    }

    tick() {
        this.physics.tick()
    }
}