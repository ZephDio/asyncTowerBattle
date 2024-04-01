import { BlueBattleTower } from "./implementation/battle-blue-tower";
import { OrangeBattleTower } from "./implementation/battle-orange-tower";
import { GreenBattleTower } from "./implementation/battle.green.tower";

export type AnyBattleTower = BlueBattleTower | GreenBattleTower | OrangeBattleTower;

// export type SerializedBattleTower = {
//   type: AnyTower["type"];
//   cell: GridPosition;
//   position: Position;
// };
