// import { HitBox } from "../../../shared/hitboxes";
// import { Position } from "../../../shared/position";
// import { PhysicEntity, Recruit } from "../../physic/physic";
// import { BattleProjectile } from "../battle/battle-projectile";
// import { Projectile } from "../entity/projectile";

// export abstract class ProjectileRecruit<B extends Projectile> implements Recruit {
//     hitbox: HitBox
//     type: B['type']
//     speed: number
//     constructor(projectile: B) {
//         this.speed = projectile.baseSpeed
//         this.type = projectile.type
//         this.hitbox = projectile.hitbox
//     }
//     abstract toPhysic(onResolve: Function, target: PhysicEntity<Recruit>, position: Position, damage: number, speed: number): BattleProjectile<B>
// }