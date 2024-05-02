import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { BattleHumanCastle } from "../engine/castle/battle/battle-human-castle";
import { Tower } from "../engine/tower/recruit/tower";
import { HudElement } from "./hud-element/hud-element";
import { Retail } from "../engine/shop/retail/retail";
import { AnyCastle } from "../engine/castle/recruit/castle-recruit";
import { AreaEffect } from "../engine/area-effect/area-effect";
import { ArmyGrid } from "../engine/grid/grid";
import { BattleGrid } from "../engine/grid/battle-grid";
import { ImplementsTrait } from "@ddd-ts/traits";
import { AnyBattleTower } from "../engine/tower/battle/battle-tower";
import { AnyBattleTile } from "../engine/tile/battle/battle-tile";
import { AnyBattleUnit } from "../engine/units/battle/battle-unit";
import { TTokenDrag } from "../engine/shop/holder/token-drag/token-drag";
import { AnyBattleProjectile } from "../engine/projectile/battle/battle-projectile";
import { BattlePath } from "../engine/path/battle/battle-path";
import { GridPosition } from "./position";
import { Inventory } from "../engine/grid/inventory/unit-inventory";

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
	castles: BattleHumanCastle[];
	towers: AnyBattleTower[];
	grid: BattleGrid;
	units: AnyBattleUnit[];
	areaEffects: AreaEffect[];
	projectiles: AnyBattleProjectile[];
	tiles: AnyBattleTile[];
	path: BattlePath;
	hudElements: HudElement[];
}

export interface ShopState extends GameState {
	type: "shop";
	retail: Retail;

	castle: AnyCastle;
	towers: ImplementsTrait<typeof Tower>[];
	path: GridPosition[] | null;
	grid: ArmyGrid;

	hold: ImplementsTrait<typeof TTokenDrag> | null;

	hudElements: HudElement[];

	inventory: Inventory;
}
