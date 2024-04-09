import { Explosion } from "./implementation/explosion";
import { FrostNova } from "./implementation/frost-nova";
import { HealWave } from "./implementation/heal-wave";
import { PoisonGround } from "./implementation/poison-ground";

export type AreaEffect = Explosion | PoisonGround | HealWave | FrostNova;
