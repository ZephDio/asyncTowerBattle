import { Explosion } from "./implementation/explosion";
import { FallenAntler } from "./implementation/fallen-antler";
import { FrostNova } from "./implementation/frost-nova";
import { HealWave } from "./implementation/heal-wave";
import { LighthouseBeam } from "./implementation/lighthouse-beam";
import { PoisonGround } from "./implementation/poison-ground";
import { PowderTrail } from "./implementation/powder-trail";

export type AreaEffect = Explosion | PoisonGround | HealWave | FrostNova | FallenAntler | PowderTrail | LighthouseBeam;
