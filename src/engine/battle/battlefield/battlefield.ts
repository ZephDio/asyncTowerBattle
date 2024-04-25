import { Army } from "../../army/army";
import { AnyBattleUnit } from "../../units/battle/battle-unit";
import { BattleArmy } from "../../army/battle/battle-army";
import { Battle } from "../battle";
import { Physic } from "../../../shared/physic";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { GridPosition } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { AnyBattleBarrack } from "../../barrack/battle/battle-barrack";
import { BattlePath } from "../../path/battle/battle-path";
import { ArmyBuff } from "../../army/battle/army-buff";

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
		public random: () => number,
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
		const alliedArmyBuff = new ArmyBuff();
		const alliedArmyBuffHooks = alliedArmyBuff.getHooks();
		const enemyArmyBuff = new ArmyBuff();
		const enemyArmyBuffHooks = enemyArmyBuff.getHooks();

		const alliedFoodEconomy = alliedArmy.foodEconomy.toBattle();
		const enemyFoodEconomy = enemyArmy.foodEconomy.toBattle();

		const enemyBattleCastle = enemyArmy.castle.toEnemy(
			grid,
			() => this.onBattleOver("victory"),
			enemyFoodEconomy.getHooks(),
		);
		const alliedBattleCastle = alliedArmy.castle.toAllied(
			grid,
			() => this.onBattleOver("defeat"),
			alliedFoodEconomy.getHooks(),
		);

		const alliedBattlePath = BattlePath.toAllied(grid, alliedArmy.path, alliedBattleCastle, enemyBattleCastle);
		const enemyBattlePath = BattlePath.toEnemy(grid, enemyArmy.path, enemyBattleCastle, alliedBattleCastle);
		const alliedBattleArmy = new BattleArmy(
			alliedFoodEconomy,
			this.searchAlliedUnitTarget.bind(this),
			this.searchEnemiesInArea.bind(this),
			this.random.bind(this),
			() => enemyBattlePath,
			() => enemyBattleCastle,
			enemyFoodEconomy.getHooks(),
			grid.getAlliedHooks(),
			alliedArmyBuffHooks,
			enemyArmyBuffHooks,
			alliedArmy.getEconomyHooks(),
			enemyArmy.getEconomyHooks(),
		);
		const enemyBattleArmy = new BattleArmy(
			enemyFoodEconomy,
			this.searchEnemyUnitTarget.bind(this),
			this.searchAlliesInArea.bind(this),
			this.random.bind(this),
			() => alliedBattlePath,
			() => alliedBattleCastle,
			alliedFoodEconomy.getHooks(),
			grid.getEnemyHooks(),
			enemyArmyBuffHooks,
			alliedArmyBuffHooks,
			enemyArmy.getEconomyHooks(),
			alliedArmy.getEconomyHooks(),
		);
		const alliedBattleTiles = alliedArmy.pathTiles.map((pathTile) =>
			pathTile.toAllied(grid, alliedBattleArmy.getHooks()),
		);
		const enemyBattleTiles = enemyArmy.pathTiles.map((pathTile) => pathTile.toEnemy(grid, enemyBattleArmy.getHooks()));

		const enemyBattleTowers = enemyArmy.towers.map((tower) => tower.toEnemy(grid, enemyBattleArmy.getHooks()));
		const alliedBattleTowers = alliedArmy.towers.map((tower) => tower.toAllied(grid, alliedBattleArmy.getHooks()));
		const enemyBattleBarracks = enemyArmy.barracks
			.map((barrack) => barrack.toEnemy(grid, enemyBattleArmy.getHooks()))
			.filter((b): b is AnyBattleBarrack => b !== undefined);
		const alliedBattleBarrack = alliedArmy.barracks
			.map((barrack) => barrack.toAllied(grid, alliedBattleArmy.getHooks()))
			.filter((b): b is AnyBattleBarrack => b !== undefined);
		const alliedBattleTotem = alliedArmy.totems.map((totem) => totem.toAllied(grid, alliedBattleArmy.getHooks()));
		const enemyBattleTotem = enemyArmy.totems.map((totem) => totem.toEnemy(grid, enemyBattleArmy.getHooks()));

		alliedBattleArmy.init(
			alliedBattleCastle,
			alliedBattlePath,
			alliedBattleTowers,
			alliedBattleBarrack,
			alliedBattleTiles,
			alliedBattleTotem,
			alliedArmyBuff,
		);
		enemyBattleArmy.init(
			enemyBattleCastle,
			enemyBattlePath,
			enemyBattleTowers,
			enemyBattleBarracks,
			enemyBattleTiles,
			enemyBattleTotem,
			enemyArmyBuff,
		);
		grid.initElements(alliedBattleArmy, enemyBattleArmy, [...alliedArmy.environment, ...enemyArmy.environment]);
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
		this.tickTotems();
		this.tickAreaEffects();
		this.tickPathTiles();
		this.tickCastles();
	}

	searchEnemiesInArea(areaPosition: GridPosition, hitbox: HitBox): AnyBattleUnit[] {
		const found: AnyBattleUnit[] = [];
		for (const enemyUnit of this.enemyArmy.units.keys()) {
			if (enemyUnit.intersects(areaPosition, hitbox)) {
				found.push(enemyUnit);
			}
		}
		return found;
	}

	searchAlliesInArea(areaPosition: GridPosition, hitbox: HitBox): AnyBattleUnit[] {
		const found: AnyBattleUnit[] = [];
		for (const alliedUnit of this.alliedArmy.units.keys()) {
			if (alliedUnit.intersects(areaPosition, hitbox)) {
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

	tickTowers() {
		for (const tower of this.alliedArmy.towers) {
			tower.tick();
		}
		for (const tower of this.enemyArmy.towers) {
			tower.tick();
		}
	}

	tickCastles() {
		this.alliedArmy.castle.tick();
		this.enemyArmy.castle.tick();
	}

	tickTotems() {
		for (const totem of this.alliedArmy.totems) {
			totem.tick();
		}
		for (const totem of this.enemyArmy.totems) {
			totem.tick();
		}
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

	get environment() {
		return this.grid;
	}
}
