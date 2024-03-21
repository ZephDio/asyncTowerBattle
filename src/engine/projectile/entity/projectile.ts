import { HitBox } from "../../../shared/hitboxes"

export abstract class Projectile {
    abstract hitbox: HitBox
    abstract type: string
    abstract baseSpeed: number
}
