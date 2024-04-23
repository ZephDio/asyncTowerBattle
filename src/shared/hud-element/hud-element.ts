import { BattleClockHud } from "./battle/battle-clock";
import { CastleLifeBar } from "./battle/army-resume/castle-life-bar";
import { SliderBattleSpeed } from "./battle/slider-speed";
import { GoldHud } from "./gold-hud";
import { RefreshBellHud } from "./refresh-bell-hud";
import { StartBattleButton } from "./start-battle-button";

export type HudElement =
	| StartBattleButton
	| GoldHud
	| RefreshBellHud
	| CastleLifeBar
	| BattleClockHud
	| SliderBattleSpeed;
