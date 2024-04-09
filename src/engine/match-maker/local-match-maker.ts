import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { ArmyFixture } from "../army/army-fixtures";
import { BarrackRecruitBuilder, BarrackRecruitFixtures } from "../barrack/recruit/barrack-recruit-fixtures";
import { CastleRecruitFixture } from "../castle/blueprint/castle";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFixture } from "../path/army/path-fixtures";
import { AnyTower } from "../tower/recruit/tower-recruit";
import { TowerBuilder, TowerFixtures } from "../tower/recruit/tower-recruit-fixtures";
import { UnitRecruitFixture } from "../units/recruit/unit-recruit-fixtures";
import { MatchMaker } from "./match-maker";

export class LocalMatchMaker extends MatchMaker {
	getOpponent(round: number) {
		if (round > 4) {
			return EnemyArmyFixtures[4]();
		}
		const key = round as keyof typeof EnemyArmyFixtures;
		return EnemyArmyFixtures[key]();
	}
}

ArmyFixture;
const EnemyArmyFixtures = {
	0: () => {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.allied;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 4, y: 4 }))
				.buildGreen(),
			//TowerEntityFixtures.topRightTower,
		];
		const path = PathFixture.default;
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 1, y: 2 }))
				.withProductionSpeed(3.3)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 0, y: 2 }))
				.withProductionSpeed(3.4)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 1, y: 0 }))
				.withProductionSpeed(3.6)
				.buildWave(),
		];
		const unitInventory = new Inventory();
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(path, grid, unitInventory);
	},
	1: () => {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.enemy;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 1 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildGreen(),
		];
		const barracks = [
			BarrackRecruitFixtures.basicWithSoldier(4),
			BarrackRecruitFixtures.waveWithDragon(),
			BarrackRecruitFixtures.basicWithPriest(),
		];
		const path = PathFixture.default;
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		return new Army(path, grid, new Inventory());
	},
	2: () => {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.enemy;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 1 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 3, y: 0 })).buildOrange(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 10, y: 0 }))
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 11, y: 0 }))
				.withProductionSpeed(3.5)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 12, y: 0 }))
				.withProductionSpeed(3.1)
				.buildWave(),
		];
		const path = PathFixture.default;
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		return new Army(path, grid, new Inventory());
	},
	3: () => {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.enemy;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 3, y: 4 })).buildOrange(),
			new TowerBuilder().celled(new Cell({ x: 3, y: 5 })).buildBlue(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 10, y: 0 }))
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.soldier)
				.withCell(new Cell({ x: 9, y: 0 }))
				.withProductionSpeed(5)
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 11, y: 0 }))
				.withProductionSpeed(3.5)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 12, y: 0 }))
				.withProductionSpeed(3.1)
				.buildWave(),
		];
		const path = PathFixture.default;
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		return new Army(path, grid, new Inventory());
	},
	4: () => {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.enemy;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 5, y: 2 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 3, y: 4 })).buildOrange(),
			new TowerBuilder().celled(new Cell({ x: 3, y: 5 })).buildBlue(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 10, y: 0 }))
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.soldier)
				.withCell(new Cell({ x: 9, y: 0 }))
				.withProductionSpeed(5)
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 11, y: 0 }))
				.withProductionSpeed(3.5)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 12, y: 0 }))
				.withProductionSpeed(3.1)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 8, y: 0 }))
				.withProductionSpeed(3.9)
				.buildWave(),
		];
		const path = PathFixture.default;
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		return new Army(path, grid, new Inventory());
	},
};

// return new ArmyPath([
// 	new BasicPathTile(new Cell({ x: 0, y: 5 })),
// 	new BasicPathTile(new Cell({ x: 0, y: 4 })),
// 	new SlowingPathTile(new Cell({ x: 0, y: 3 })),
// 	new SlowingPathTile(new Cell({ x: 1, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 2, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 2, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 3, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 4, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 4, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 5, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 6, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 7, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 8, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 9, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 9, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 10, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 10, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 11, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 12, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 12, y: 4 })),
// ]);
