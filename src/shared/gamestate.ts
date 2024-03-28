import { ArmyPath, SerializedPath } from "../engine/path/entity/path";
import { BattleVerdict } from "../engine/battle-summary/battle-summary";
import { SerializedBattleCastle } from "../engine/castle/battle/battle-castle";
import { SerializedBattleTower } from "../engine/tower/battle/battle-tower";
import { SerializedTowerRecruit, TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { PhysicEntity } from "./physic";
import { UnitRecruit } from "../engine/units/recruit/unit-recruit";
import { Unit } from "../engine/units/entity/units";
import { Projectile } from "../engine/projectile/entity/projectile";
import { HudElement } from "./hud-element";
import { Retail } from "../engine/shop/retail";
import { CastleRecruit, SerializedCastleRecruit } from "../engine/castle/recruit/castle-recruit";
import { AreaEffect } from "../engine/area-effect/area-effect";
import { Grid, SerializedGrid } from "../engine/grid/grid";
import { TokenDrag } from "../engine/shop/token-dragable";
import { Castle } from "../engine/castle/entity/castle";

export interface GameState {
	type: string;
}

export interface SummaryState extends GameState {
	type: "summary";
	battleVerdict: BattleVerdict;
}

export interface BattleState extends GameState {
	type: "battle";
	castles: SerializedBattleCastle[];
	towers: SerializedBattleTower[];
	paths: SerializedPath[];
	grid: SerializedGrid;
	entities: PhysicEntity<UnitRecruit<Unit>>[];
	areaEffects: AreaEffect[];
	projectiles: PhysicEntity<Projectile>[];
}

export interface ShopState extends GameState {
	type: "shop";
	retail: Retail;

	castle: SerializedCastleRecruit;
	towers: SerializedTowerRecruit[];
	path: SerializedPath;
	grid: SerializedGrid;

	hold: TokenDrag | null;

	hudElements: HudElement[];
}

export interface ShopState2 extends GameState {
	type: "shop";
	retail: Retail;

	castle: CastleRecruit<Castle>;
	towers: TowerRecruit[];
	path: ArmyPath;
	grid: Grid;

	hold: TokenDrag | null;

	hudElements: HudElement[];
}
