import { Position } from "../../../shared/position";
import { PathFinder } from "../../physic/path-finder";
import { PhysicEntity, Recruit } from "../../physic/physic";
import { Projectile } from "../entity/projectile";

export abstract class BattleProjectile<PR extends Projectile> extends PhysicEntity<Projectile>{
    pathFinder: PathFinder;
    constructor(public projectileRecruit: PR, position: Position, public onResolve: Function,public target: PhysicEntity<Recruit>, public damage: number) {
        super(projectileRecruit, position)
        this.pathFinder = new PathFinder([target.position]);
    }

    abstract canMove(): boolean;

    followPath(): void {
        if (this.canMove() && !this.pathFinder.isArrived) {
            const tetha = this.pathFinder.getOrientation(this.position);
            const newPosition = {
                x: this.position.x + Math.cos(tetha * this.projectileRecruit.baseSpeed),
                y: this.position.y + Math.sin(tetha * this.projectileRecruit.baseSpeed),
            };
            this.move(newPosition);
        }
        if (this.pathFinder.isArrived) {
           this.hit()
        }
    }

    tick() {
        this.followPath()
    }

    hit(){
        this.target.isAttacked(this.damage)
        this.onResolve(this)
    }

    move(newPosition: Position) {
        this.position.x = newPosition.x
        this.position.y = newPosition.y
    }
}