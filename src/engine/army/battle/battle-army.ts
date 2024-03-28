import { BattleBarrack } from "../../barrack/battle/battle-barrack";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { BattlePath } from "../../path/entity/path";
import { BattleProjectile } from "../../projectile/battle/battle-projectile";
import { Projectile } from "../../projectile/entity/projectile";
import { BattleTower } from "../../tower/battle/battle-tower";
import { BattleUnit } from "../../units/battle/entity-units-physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { SearchAreaForUnit, SearchTarget } from "../../battle/battlefield/battlefield";
import { AreaEffect } from "../../area-effect/area-effect";
import { BattleGrid } from "../../grid/battle-grid";
import { BarrackRecruit } from "../../barrack/recruit/barrack-recruit";

export type BattleArmyHooks = {
	addUnits: BattleArmy["addUnit"];
	removeUnit: BattleArmy["removeUnit"];
	addProjectile: BattleArmy["addProjectile"];
	removeProjectile: BattleArmy["removeProjectile"];
	addAreaEffect: BattleArmy["addAreaEffect"];
	removeAreaEffect: BattleArmy["removeAreaEffect"];
	searchTarget: BattleArmy["searchTarget"];
	searchEnemyInArea: BattleArmy["searchEnemyInArea"];
};

export class BattleArmy {
	units: Map<BattleUnit<UnitRecruit<Unit>>, BattleBarrack<BarrackRecruit>> = new Map();
	areaEffects: Map<AreaEffect, any> = new Map();
	path: BattlePath;
	castle: BattleCastle;
	barracks: BattleBarrack<BarrackRecruit>[];
	projectiles: Map<BattleProjectile<Projectile>, BattleTower> = new Map();
	towers: BattleTower[];

	constructor(
		public grid: BattleGrid,
		public searchTarget: SearchTarget,
		public searchEnemyInArea: SearchAreaForUnit,
	) {
		// this.castle = alliedCastle;
		// this.path = army.path;
		// this.barracks = barracks.map(
		//   (barrack) =>
		//     new SoldierBattleBarrack(
		//       barrack.productionSpeed,
		//       { x: alliedCastle.position.x, y: alliedCastle.position.y },
		//       enemyPath,
		//       enemyCastle,
		//       (entityRecruit: BattleUnit<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<UnitRecruit<Unit>>) => {
		//         this.addUnit(entityRecruit, battleBarrack);
		//       },
		//       (entityRecruit: BattleUnit<UnitRecruit<Unit>>) => {
		//         this.removeUnit(entityRecruit);
		//       },
		//       barrack.unitRecruit
		//     )
		// );
		// this.towers = army.towers.map((tower) => tower.toPhysic(this.grid.gridPositionToReal(tower.gridPosition), this.getHooks()));
	}

	init(castle: BattleCastle, path: BattlePath, towers: BattleTower[], barracks: BattleBarrack<BarrackRecruit>[]) {
		this.castle = castle;
		this.path = path;
		this.towers = towers;
		this.barracks = barracks;
	}

	addUnit(entityRecruit: BattleUnit<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<BarrackRecruit>) {
		this.units.set(entityRecruit, battleBarrack);
	}

	removeUnit(entityRecruit: BattleUnit<UnitRecruit<Unit>>) {
		this.units.delete(entityRecruit);
	}

	addProjectile(projectile: BattleProjectile<Projectile>, source: BattleTower) {
		this.projectiles.set(projectile, source);
	}

	removeProjectile(projectile: BattleProjectile<Projectile>) {
		this.projectiles.delete(projectile);
	}

	addAreaEffect(areaEffect: AreaEffect, source: any) {
		this.areaEffects.set(areaEffect, source);
	}

	removeAreaEffect(areaEffect: AreaEffect) {
		this.areaEffects.delete(areaEffect);
	}

	getHooks(): BattleArmyHooks {
		return {
			addUnits: this.addUnit.bind(this),
			removeUnit: this.removeUnit.bind(this),
			addProjectile: this.addProjectile.bind(this),
			removeProjectile: this.removeProjectile.bind(this),
			addAreaEffect: this.addAreaEffect.bind(this),
			removeAreaEffect: this.removeAreaEffect.bind(this),
			searchTarget: this.searchTarget.bind(this),
			searchEnemyInArea: this.searchEnemyInArea.bind(this),
		};
	}

	// static build(
	//   army: Army,
	//   enemyCastle: BattleCastle,
	//   alliedCastle: BattleCastle,
	//   enemyPath: BattlePath,
	//   grid: BattleGrid,
	//   towers: BattleTower<TowerRecruit<Tower>>[],
	//   setTarget: SearchTarget,
	//   searchEnemiesInArea: SearchAreaForUnit
	// ) {
	//   return new BattleArmy(
	//     army,
	//     enemyCastle,
	//     alliedCastle,
	//     enemyPath,
	//     army.barracks as SoldierBarrack[],
	//     grid,
	//     towers,
	//     setTarget,
	//     searchEnemiesInArea
	//   );
	// }
}
