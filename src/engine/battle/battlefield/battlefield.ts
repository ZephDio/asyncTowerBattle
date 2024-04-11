import { Army } from "../../army/army";
import { AnyBattleUnit } from "../../units/battle/battle-unit";
import { BattleArmy } from "../../army/battle/battle-army";
import { Battle } from "../battle";
import { Physic } from "../../../shared/physic";
import { HitBox } from "../../../shared/hitboxes";
import { GridPosition } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { AnyBattleBarrack } from "../../barrack/battle/battle-barrack";
import { BattlePath } from "../../path/battle/battle-path";

export type SearchTarget = Battlefield["searchAlliedUnitTarget"] | Battlefield["searchEnemyUnitTarget"];
export type SearchAreaForUnit = Battlefield["searchAlliesInArea"] | Battlefield["searchEnemiesInArea"];
export class Battlefield {
	public alliedArmy: BattleArmy;
	public enemyArmy: BattleArmy;
	public grid: BattleGrid;
	constructor(
		alliedArmy: Army,
		enemyArmy: Army,
		public onBattleOver: Battle["handleBattleOver"],
	) {
		const { alliedBattleArmy, enemyBattleArmy, battleGrid } = this.init(alliedArmy, enemyArmy);
		this.alliedArmy = alliedBattleArmy;
		this.enemyArmy = enemyBattleArmy;
		this.grid = battleGrid;
	}

	init(
		alliedArmy: Army,
		enemyArmy: Army,
	): { alliedBattleArmy: BattleArmy; enemyBattleArmy: BattleArmy; battleGrid: BattleGrid } {
		const grid = BattleGrid.fuse(alliedArmy.grid, enemyArmy.grid);

		const alliedBattleArmy = new BattleArmy(
			this.searchAlliedUnitTarget.bind(this),
			this.searchEnemiesInArea.bind(this),
			grid.getAlliedHooks(),
		);
		const enemyBattleArmy = new BattleArmy(
			this.searchEnemyUnitTarget.bind(this),
			this.searchAlliesInArea.bind(this),
			grid.getEnemyHooks(),
		);
		const enemyBattleCastle = enemyArmy.castle.toEnemy(grid, () => this.onBattleOver("victory"));
		const alliedBattleCastle = alliedArmy.castle.toAllied(grid, () => this.onBattleOver("defeat"));
		const alliedBattleTiles = alliedArmy.pathTiles.map((pathTile) =>
			pathTile.toAllied(grid, alliedBattleArmy.getHooks()),
		);
		const enemyBattleTiles = enemyArmy.pathTiles.map((pathTile) => pathTile.toEnemy(grid, enemyBattleArmy.getHooks()));
		const alliedBattlePath = BattlePath.toAllied(grid, alliedArmy.path, alliedBattleCastle, enemyBattleCastle);
		const enemyBattlePath = BattlePath.toEnemy(grid, enemyArmy.path, enemyBattleCastle, alliedBattleCastle);

		const enemyBattleTowers = enemyArmy.towers.map((tower) => tower.toEnemy(grid, enemyBattleArmy.getHooks()));
		const alliedBattleTowers = alliedArmy.towers.map((tower) => tower.toAllied(grid, alliedBattleArmy.getHooks()));
		const enemyBattleBarracks = enemyArmy.barracks
			.map((barrack) => barrack.toEnemy(grid, alliedBattlePath, enemyBattleArmy.getHooks()))
			.filter((b): b is AnyBattleBarrack => b !== undefined);
		const alliedBattleBarrack = alliedArmy.barracks
			.map((barrack) => barrack.toAllied(grid, enemyBattlePath, alliedBattleArmy.getHooks()))
			.filter((b): b is AnyBattleBarrack => b !== undefined);
		alliedBattleArmy.init(
			alliedBattleCastle,
			alliedBattlePath,
			alliedBattleTowers,
			alliedBattleBarrack,
			alliedBattleTiles,
		);
		enemyBattleArmy.init(enemyBattleCastle, enemyBattlePath, enemyBattleTowers, enemyBattleBarracks, enemyBattleTiles);
		grid.initElements(alliedBattleArmy, enemyBattleArmy);
		return {
			alliedBattleArmy: alliedBattleArmy,
			enemyBattleArmy: enemyBattleArmy,
			battleGrid: grid,
		};
	}

	tick() {
		this.tickBarracks();
		this.tickProjectiles();
		this.tickUnits();
		this.tickTowers();
		this.tickAreaEffects();
		this.tickPathTiles();
	}

	tickTowers() {
		for (const tower of this.alliedArmy.towers) {
			tower.tick();
		}
		for (const tower of this.enemyArmy.towers) {
			tower.tick();
		}
	}

	searchEnemiesInArea(areaPosition: GridPosition, hitbox: HitBox): AnyBattleUnit[] {
		const found: AnyBattleUnit[] = [];
		for (const enemyUnit of this.enemyArmy.units.keys()) {
			if (enemyUnit.collides(hitbox, areaPosition)) {
				found.push(enemyUnit);
			}
		}
		return found;
	}

	searchAlliesInArea(areaPosition: GridPosition, hitbox: HitBox): AnyBattleUnit[] {
		const found: AnyBattleUnit[] = [];
		for (const alliedUnit of this.alliedArmy.units.keys()) {
			if (alliedUnit.collides(hitbox, areaPosition)) {
				found.push(alliedUnit);
			}
		}
		return found;
	}

	searchAlliedUnitTarget(
		position: GridPosition,
		criteria: (enemyUnit: AnyBattleUnit, distanceSqrd: number) => boolean,
	) {
		let bestTarget: [AnyBattleUnit | null, number] = [null, Infinity];
		for (const enemyUnit of [...this.enemyArmy.units.keys()]) {
			const distanceSqrd = Physic.getDistanceSqrd(position, enemyUnit.position);
			if (criteria(enemyUnit, distanceSqrd)) {
				if (distanceSqrd < bestTarget[1]) {
					bestTarget = [enemyUnit, distanceSqrd];
				}
			}
		}
		return bestTarget[0];
	}

	searchEnemyUnitTarget(position: GridPosition, criteria: (enemyUnit: AnyBattleUnit, distanceSqrd: number) => boolean) {
		let bestTarget: [AnyBattleUnit | null, number] = [null, Infinity];
		for (const enemyUnit of [...this.alliedArmy.units.keys()]) {
			const distanceSqrd = Physic.getDistanceSqrd(position, enemyUnit.position);
			if (criteria(enemyUnit, distanceSqrd)) {
				if (distanceSqrd < bestTarget[1]) {
					bestTarget = [enemyUnit, distanceSqrd];
				}
			}
		}
		return bestTarget[0];
	}
	tickBarracks() {
		for (const barrack of this.alliedArmy.barracks) {
			barrack.tick();
		}
		for (const barrack of this.enemyArmy.barracks) {
			barrack.tick();
		}
	}

	tickPathTiles() {
		for (const tile of this.alliedArmy.tiles) {
			tile.tick();
		}
		for (const tile of this.enemyArmy.tiles) {
			tile.tick();
		}
	}

	tickUnits() {
		for (const unit of this.alliedArmy.units.keys()) {
			unit.tick();
		}
		for (const unit of this.enemyArmy.units.keys()) {
			unit.tick();
		}
	}

	tickProjectiles() {
		for (const projectile of this.alliedArmy.projectiles.keys()) {
			projectile.tick();
		}
		for (const projectile of this.enemyArmy.projectiles.keys()) {
			projectile.tick();
		}
	}

	tickAreaEffects() {
		for (const areaEffect of this.alliedArmy.areaEffects.keys()) {
			areaEffect.tick();
		}
		for (const areaEffect of this.enemyArmy.areaEffects.keys()) {
			areaEffect.tick();
		}
	}

	get units() {
		return [...this.alliedArmy.units.keys(), ...this.enemyArmy.units.keys()];
	}

	get projectiles() {
		return [...this.alliedArmy.projectiles.keys(), ...this.enemyArmy.projectiles.keys()];
	}

	get areaEffects() {
		return [...this.alliedArmy.areaEffects.keys(), ...this.enemyArmy.areaEffects.keys()];
	}
}
