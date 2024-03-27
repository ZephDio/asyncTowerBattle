// import { Position } from "../../../../shared/position"
// import { PhysicEntity, Recruit } from "../../../physic/physic"
// import { BattleProjectile } from "../../battle/battle-projectile"
// import { BattleBulletProjectile } from "../../battle/implementation/bullet-projectile-battle"
// import { Bullet } from "../../entity/implementation/bullet"
// import { ProjectileRecruit } from "../projectile-recruit"

// export class BulletRecruit extends ProjectileRecruit<Bullet>{
//     constructor(bullet: Bullet) {
//         super(bullet)
//     }

//     toPhysic(onResolve: Function, target: PhysicEntity<Recruit>, position: Position, damage: number): BattleBulletProjectile {
//         return new BattleBulletProjectile(this, onResolve, target, position, damage)
//     }
// }
