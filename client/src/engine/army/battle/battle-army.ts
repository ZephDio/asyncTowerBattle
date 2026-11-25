import { AnyBattleProjectile } from "../../projectile/battle/battle-projectile";
import { AnyBattleTower } from "../../constructs/tower/battle/battle-tower";
import { SearchAreaForUnit, SearchAreaForConstruct, SearchTarget } from "../../battle/battlefield/battlefield";
import { AreaEffect } from "../../area-effect/area-effect";
import { GridHooks } from "../../grid/battle-grid";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyBattleBarrack } from "../../constructs/barrack/battle/battle-barrack";
import { AnyBattleUnit } from "../../units/battle/battle-unit";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { GridPosition } from "../../../shared/position";
import { AnyBattleTile } from "../../tile/battle/battle-tile";
import { AnyBattleTotem } from "../../constructs/totem/battle/battle-totem";
import { BattleFoodEconomy, FoodHooks } from "../../food/battle-food-economy";
import { ArmyBuff, ArmyBuffHooks, Buff } from "./army-buff";
import { EconomyHooks } from "../../gold/army-gold-economy";
import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { BattleStartTrigger } from "../../../shared/traits/engine/battle-start";
import { TokenUnit } from "../../../shared/traits/engine/token-unit";
import { Furry } from "./furry";
import { AnyBattleCastle } from "../../castle/battle";
import { SpawnQueue } from "./spawn-queue";

export type BattleArmyHooks = {
	random: () => number;
	timer: () => { clock: number };
	addUnits: BattleArmy["enqueueUnit"];
	getDefaultUnit: BattleArmy["getDefaultUnit"];
	removeUnit: BattleArmy["removeUnit"];
	addProjectile: BattleArmy["addProjectile"];
	removeProjectile: BattleArmy["removeProjectile"];
	addAreaEffect: BattleArmy["addAreaEffect"];
	removeAreaEffect: BattleArmy["removeAreaEffect"];
	searchTarget: BattleArmy["searchTarget"];
	searchEnemyInArea: BattleArmy["searchEnemyInArea"];
	searchAlliesInArea: BattleArmy["searchAlliesInArea"];
	getEnemyPath: BattleArmy["getEnemyPath"];
	searchEnemyConstructsInArea: BattleArmy["searchEnemyConstructsInArea"];
	searchAlliesConstructsInArea: BattleArmy["searchAlliesConstructsInArea"];
	getEnemyCastle: BattleArmy["getEnemyCastle"];
	getAlliedUnits: () => AnyBattleUnit[];
	getEnemyUnits: () => AnyBattleUnit[];
	getAlliedCastle: () => AnyBattleCastle;
	triggerFurry: () => void;
	onEnemyCastleHit: (listener: () => void) => void;
	onUnitAdded: (listener: (unit: AnyBattleUnit) => void) => void;
	notifyEnemyCastleHit: () => void;
	alliedArmyBuffHooks: ArmyBuffHooks;
	enemyArmyBuffHooks: ArmyBuffHooks;
	alliedFoodHooks: FoodHooks;
	enemyFoodHooks: FoodHooks;
	gridHooks: GridHooks;
	alliedEconomyHooks: EconomyHooks;
	enemyEconomyHooks: EconomyHooks;
};

export class BattleArmy {
	units: Map<AnyBattleUnit, AnyBattleBarrack> = new Map();
	areaEffects: Map<AreaEffect, any> = new Map();
	path: BattlePath;
	castle: AnyBattleCastle;
	barracks: AnyBattleBarrack[];
	projectiles: Map<AnyBattleProjectile, any> = new Map();
	towers: AnyBattleTower[];
	tiles: AnyBattleTile[];

	armyBuff: ArmyBuff;
	totems: AnyBattleTotem[];
	furry: Furry;
	private enemyCastleHitListeners: Array<() => void> = [];
	private unitAddedListeners: Array<(unit: AnyBattleUnit) => void> = [];
	private spawnQueue = new SpawnQueue(this.addUnit.bind(this));

	constructor(
		public foodEconomy: BattleFoodEconomy,
		public searchTarget: SearchTarget,
		public searchEnemyInArea: SearchAreaForUnit,
		public searchEnemyConstructsInArea: SearchAreaForConstruct,
		public searchAlliesConstructsInArea: SearchAreaForConstruct,
		public random: () => number,
		public getTimer: () => { clock: number },
		public getEnemyPath: () => BattlePath,
		public getEnemyCastle: () => AnyBattleCastle,
		public getDefaultUnit: () => ImplementsTrait<typeof TokenUnit>,
		public enemyFoodHooks: FoodHooks,
		public gridHooks: GridHooks,
		public alliedArmyBuffHooks: ArmyBuffHooks,
		public enemyArmyBuffHooks: ArmyBuffHooks,

		public alliedGoldEconomyHooks: EconomyHooks,

		public enemyGoldEconomyHooks: EconomyHooks,
		public getEnemyUnits: () => AnyBattleUnit[] = () => [],
	) {
		this.surchargeBuffHooks();
		this.furry = new Furry(0, 0, this.getTimer);
	}

	surchargeBuffHooks() {
		const defaultUnitHook = this.alliedArmyBuffHooks.addUnitBuff;
		this.alliedArmyBuffHooks.addUnitBuff = (buff, amount) => {
			this.addUnitBuffs(buff, amount);
			defaultUnitHook(buff, amount);
		};

		const defaultTowerHook = this.alliedArmyBuffHooks.addTowerBuff;
		this.alliedArmyBuffHooks.addTowerBuff = (buff, amount) => {
			this.addTowerBuffs(buff, amount);
			defaultTowerHook(buff, amount);
		};
	}

	init(
		castle: AnyBattleCastle,
		path: BattlePath,
		towers: AnyBattleTower[],
		barracks: AnyBattleBarrack[],
		tiles: AnyBattleTile[],
		totems: AnyBattleTotem[],
		armyBuff: ArmyBuff,
	) {
		this.castle = castle;
		this.path = path;
		this.towers = towers;
		this.barracks = barracks;
		this.tiles = tiles;
		this.totems = totems;
		this.armyBuff = armyBuff;
	}

	triggerBattleStartEffects() {
		for (const element of [...this.towers, ...this.totems, ...this.barracks, this.castle]) {
			if (implementsTrait(element, BattleStartTrigger)) {
				element.onBattleStart();
			}
		}
	}

	onEnemyCastleHit(listener: () => void) {
		this.enemyCastleHitListeners.push(listener);
	}

	// Called for every unit that joins the army from now on.
	onUnitAdded(listener: (unit: AnyBattleUnit) => void) {
		this.unitAddedListeners.push(listener);
	}

	notifyEnemyCastleHit() {
		for (const listener of [...this.enemyCastleHitListeners]) listener();
	}

	addFurryBuff(unit: AnyBattleUnit) {
		unit.addFurry(this.furry.getFurry());
	}

	addUnitBuffs(buffs: Buff, amount: number = 1) {
		[...this.units.keys()].forEach((unit: AnyBattleUnit) => {
			unit.applyBuff(buffs, amount);
		});
	}

	addTowerBuffs(buffs: Buff, amount: number = 1) {
		this.towers.forEach((tower) => {
			tower.applyBuff(buffs, amount);
		});
	}

	// Units added through the hooks wait in the spawn queue, which makes them join with `addUnit` a few ticks apart.
	enqueueUnit(entityRecruit: AnyBattleUnit, source: any) {
		this.spawnQueue.enqueue(entityRecruit, source);
	}

	tickSpawnQueue() {
		this.spawnQueue.tick();
	}

	addUnit(entityRecruit: AnyBattleUnit, source: any) {
		entityRecruit.initArmyBuffs(this.armyBuff.getUnitArmyBuffs());
		this.addFurryBuff(entityRecruit);
		this.units.set(entityRecruit, source);
		for (const listener of [...this.unitAddedListeners]) listener(entityRecruit);
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

	searchAlliesInArea(areaPosition: GridPosition, hitbox: HitBox): AnyBattleUnit[] {
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
			random: this.random.bind(this),
			timer: this.getTimer.bind(this),
			addUnits: this.enqueueUnit.bind(this),
			getDefaultUnit: this.getDefaultUnit.bind(this),
			removeUnit: this.removeUnit.bind(this),
			addProjectile: this.addProjectile.bind(this),
			removeProjectile: this.removeProjectile.bind(this),
			addAreaEffect: this.addAreaEffect.bind(this),
			removeAreaEffect: this.removeAreaEffect.bind(this),
			searchTarget: this.searchTarget.bind(this),
			searchEnemyInArea: this.searchEnemyInArea.bind(this),
			searchAlliesInArea: this.searchAlliesInArea.bind(this),
			searchEnemyConstructsInArea: this.searchEnemyConstructsInArea.bind(this),
			searchAlliesConstructsInArea: this.searchAlliesConstructsInArea.bind(this),
			getEnemyPath: this.getEnemyPath.bind(this),
			getEnemyCastle: this.getEnemyCastle.bind(this),
			getAlliedCastle: () => this.castle,
			getAlliedUnits: () => [...this.units.keys()],
			getEnemyUnits: () => this.getEnemyUnits(),
			triggerFurry: () => this.furry.increaseFurry(),
			onEnemyCastleHit: this.onEnemyCastleHit.bind(this),
			onUnitAdded: this.onUnitAdded.bind(this),
			notifyEnemyCastleHit: this.notifyEnemyCastleHit.bind(this),
			alliedArmyBuffHooks: this.alliedArmyBuffHooks,
			enemyArmyBuffHooks: this.enemyArmyBuffHooks,
			alliedFoodHooks: this.foodEconomy.getHooks(),
			enemyFoodHooks: this.enemyFoodHooks,
			gridHooks: this.gridHooks,
			alliedEconomyHooks: this.alliedGoldEconomyHooks,
			enemyEconomyHooks: this.enemyGoldEconomyHooks,
		};
	}
}
