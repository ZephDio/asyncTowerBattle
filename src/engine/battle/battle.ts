import { Army } from "../army/army";
import { Physics } from "../physic/physics";


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
        const loop = () => {
            setTimeout(() => {
                this.tick();
                loop();
            }, 31);
        };
        loop();
    }

    cloneArmy(playerArmy: Army) {
        return new Army(
            playerArmy.castle.clone(),
            playerArmy.towers.map((tower) => tower.clone()),
            playerArmy.path
        )
    }

    tick() {
        this.physics.tick()
    }
}