import { Explosion } from "./implementation/explosion";
import { PoisonGround } from "./implementation/poison-ground";

// export abstract class AreaEffect {
//   abstract type: string;
//   abstract position: Position;
//   abstract hitbox: HitBox;
//   abstract size: Size;
//   abstract tick(): void;
// }

export type AreaEffect = Explosion | PoisonGround;
