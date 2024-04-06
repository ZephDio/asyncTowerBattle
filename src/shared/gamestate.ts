import { ArmyPath } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleCastle } from "../engine/castle/battle/battle-castle";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { HudElement } from "./hud-element/hud-element";
import { Retail } from "../engine/shop/retail";
import { CastleRecruit } from "../engine/castle/recruit/castle-recruit";
import { AreaEffect } from "../engine/area-effect/area-effect";
import { ArmyGrid } from "../engine/grid/grid";
import { Castle } from "../engine/castle/entity/castle";
import { BattleGrid } from "../engine/grid/battle-grid";
import { ImplementsTrait } from "@ddd-ts/traits";
import { AnyBattleTower } from "../engine/tower/battle/battle-tower";
import { AnyBattleTile } from "../engine/tile/battle/battle-tile";
import { AnyBattleUnit } from "../engine/units/battle/battle-unit";
import { TTokenDrag } from "../engine/shop/token-drag/token-drag";
import { AnyBattleProjectile } from "../engine/projectile/battle/battle-projectile";

export interface GameState {
	type: string;
	grid: ArmyGrid | BattleGrid;
}

export interface SummaryState extends GameState {
	type: "summary";
	battleVerdict: BattleVerdict;
}

export interface BattleState extends GameState {
	type: "battle";
	castles: BattleCastle[];
	towers: AnyBattleTower[];
	paths: AnyBattleTile[];
	grid: BattleGrid;
	units: AnyBattleUnit[];
	areaEffects: AreaEffect[];
	projectiles: AnyBattleProjectile[];
}

export interface ShopState extends GameState {
	type: "shop";
	retail: Retail;

	castle: CastleRecruit<Castle>;
	towers: ImplementsTrait<typeof TowerRecruit>[];
	path: ArmyPath;
	grid: ArmyGrid;

	hold: ImplementsTrait<typeof TTokenDrag> | null;

	hudElements: HudElement[];
}
