import { BattleClockHud } from "./battle/battle-clock";
import { ButtonSpeedHUD } from "./battle/button-speed";
import { CastleLifeBar } from "./battle/castle-life-bar";
import { GoldHud } from "./gold-hud";
import { RefreshBellHud } from "./refresh-bell-hud";
import { StartBattleButton } from "./start-battle-button";

export type HudElement = StartBattleButton | GoldHud | RefreshBellHud | ButtonSpeedHUD | CastleLifeBar | BattleClockHud;
