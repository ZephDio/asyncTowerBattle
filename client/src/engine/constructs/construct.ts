import { AnyBattleBarrack } from "./barrack/battle/battle-barrack";
import { AnyBattleTotem } from "./totem/battle/battle-totem";
import { AnyBattleTower } from "./tower/battle/battle-tower";

export type AnyBattleConstruct = AnyBattleBarrack | AnyBattleTotem | AnyBattleTower;
