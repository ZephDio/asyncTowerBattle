import { BattleClockHud } from "./battle/battle-clock";
import { CastleLifeBar } from "./battle/army-resume/castle-life-bar";
import { SliderBattleSpeed } from "./battle/slider-speed";
import { GoldHud } from "./gold-hud";
import { RefreshBellHud } from "./refresh-bell-hud";
import { StartBattleButton } from "./start-battle-button";
import { SelectDwarfButton } from "../../engine/menu/huds/select-dwarf-button";
import { SelectHumanButton } from "../../engine/menu/huds/select-human-button";
import { StartGameButton } from "../../engine/menu/huds/start-game-button";

export type HudElement =
	| StartGameButton
	| StartBattleButton
	| GoldHud
	| RefreshBellHud
	| CastleLifeBar
	| BattleClockHud
	| SliderBattleSpeed
	| SelectDwarfButton
	| SelectHumanButton
