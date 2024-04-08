import { Explosion } from "./implementation/explosion";
import { HealWave } from "./implementation/heal-wave";
import { PoisonGround } from "./implementation/poison-ground";

export type AreaEffect = Explosion | PoisonGround | HealWave;
