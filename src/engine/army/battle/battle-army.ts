import { BattleCastle } from "../../castle/battle/battle-castle";
import { AnyBattleProjectile } from "../../projectile/battle/battle-projectile";
import { AnyBattleTower } from "../../tower/battle/battle-tower";
import { SearchAreaForUnit, SearchTarget } from "../../battle/battlefield/battlefield";
import { AreaEffect } from "../../area-effect/area-effect";
import { GridHooks } from "../../grid/battle-grid";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyBattleBarrack } from "../../barrack/battle/battle-barrack";
import { AnyBattleUnit } from "../../units/battle/battle-unit";
import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
export type BattleArmyHooks = {
	addUnits: BattleArmy["addUnit"];
	removeUnit: BattleArmy["removeUnit"];
	addProjectile: BattleArmy["addProjectile"];
	removeProjectile: BattleArmy["removeProjectile"];
	addAreaEffect: BattleArmy["addAreaEffect"];
	removeAreaEffect: BattleArmy["removeAreaEffect"];
	searchTarget: BattleArmy["searchTarget"];
	searchEnemyInArea: BattleArmy["searchEnemyInArea"];
	searchAlliesInArea: BattleArmy["searchAlliesInArea"];
	gridHooks: GridHooks;
};

export class BattleArmy {
	units: Map<AnyBattleUnit, AnyBattleBarrack> = new Map();
	areaEffects: Map<AreaEffect, any> = new Map();
	path: BattlePath;
	castle: BattleCastle;
	barracks: AnyBattleBarrack[];
	projectiles: Map<AnyBattleProjectile, any> = new Map();
	towers: AnyBattleTower[];

	constructor(
		public searchTarget: SearchTarget,
		public searchEnemyInArea: SearchAreaForUnit,
		public gridHooks: GridHooks,
	) {}

	init(castle: BattleCastle, path: BattlePath, towers: AnyBattleTower[], barracks: AnyBattleBarrack[]) {
		this.castle = castle;
		this.path = path;
		this.towers = towers;
		this.barracks = barracks;
	}

	addUnit(entityRecruit: AnyBattleUnit, battleBarrack: AnyBattleBarrack) {
		this.units.set(entityRecruit, battleBarrack);
	}

	removeUnit(entityRecruit: AnyBattleUnit) {
		this.units.delete(entityRecruit);
	}

	addProjectile(projectile: AnyBattleProjectile, source: any) {
		this.projectiles.set(projectile, source);
	}

	removeProjectile(projectile: AnyBattleProjectile) {
		this.projectiles.delete(projectile);
	}

	addAreaEffect(areaEffect: AreaEffect, source: any) {
		this.areaEffects.set(areaEffect, source);
	}

	removeAreaEffect(areaEffect: AreaEffect) {
		this.areaEffects.delete(areaEffect);
	}

	searchAlliesInArea(areaPosition: Position, hitbox: HitBox): AnyBattleUnit[] {
		const found: AnyBattleUnit[] = [];
		for (const alliedUnit of this.units.keys()) {
			if (alliedUnit.collides(hitbox, areaPosition)) {
				found.push(alliedUnit);
			}
		}
		return found;
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
			searchAlliesInArea: this.searchAlliesInArea.bind(this),
			gridHooks: this.gridHooks,
		};
	}
}
