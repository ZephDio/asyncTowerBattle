import { BattleClockHud } from "./battle/battle-clock";
import { CastleLifeBar } from "./battle/army-resume/castle-life-bar";
import { SliderBattleSpeed } from "./battle/slider-speed";
import { GoldHud } from "./gold-hud";
import { RefreshBellHud } from "./refresh-bell-hud";
import { StartBattleButton } from "./start-battle-button";
import { SelectDwarfButton } from "../../engine/menu/huds/select-dwarf-button";
import { SelectHumanButton } from "../../engine/menu/huds/select-human-button";
import { StartGameButton } from "../../engine/menu/huds/start-game-button";
import { HideHud } from "../../engine/battle-summary/huds/hide-hud";
import { BattleVerdictHud } from "../../engine/battle-summary/huds/battle-verdict-hud";
import { NextRoundHud } from "../../engine/battle-summary/huds/next-round-hud";
import { LifeRemainingHud } from "../../engine/battle-summary/huds/life-remaining-hud";

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
	| HideHud
	| BattleVerdictHud
	| NextRoundHud
	| LifeRemainingHud
