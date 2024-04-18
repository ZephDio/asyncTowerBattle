import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { ArmyFixture } from "../army/army-fixtures";
import { BarrackRecruitBuilder } from "../barrack/recruit/barrack-recruit-fixtures";
import { CastleFactory } from "../castle/blueprint/castle";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFactory } from "../path/army/path-fixtures";
import { AnyTower } from "../tower/recruit/tower-recruit";
import { TowerBuilder } from "../tower/recruit/tower-recruit-fixtures";
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
	1: () => {
		const grid = new ArmyGrid(6, 4, undefined, 7);
		const castle = CastleFactory.default;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 2 }))
				.buildGreen(),
		];
		const tiles = PathFactory.default;
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
		];
		const unitInventory = new Inventory();
		[castle, ...towers, ...tiles, ...barracks].map((e) => grid.setElement(e));
		return { army : new Army(grid, unitInventory), randomSeed : 123456};
	},
	2: () => {
		const grid = new ArmyGrid(8, 5);
		const castle = CastleFactory.round2;
		const towers = [new TowerBuilder().celled(new Cell({ x: 3, y: 2 })).buildGreen()];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
		];
		const tiles = PathFactory.round2;
		[castle, ...towers, ...barracks, ...tiles].map((e) => grid.setElement(e));
		return { army : new Army(grid, new Inventory()), randomSeed : 123456};
	},
	3: () => {
		const grid = new ArmyGrid(8, 5, undefined, 7);
		const castle = CastleFactory.round2;
		const towers = [new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen()];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
		];
		const tiles = PathFactory.round2;
		[castle, ...towers, ...tiles, ...barracks].map((e) => grid.setElement(e));
		return { army : new Army(grid, new Inventory()), randomSeed : 123456};
	},
	4: () => {
		const grid = new ArmyGrid(8, 5, undefined, 7);
		const castle = CastleFactory.round2;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen(),
			//new TotemBuilder().celled(new Cell({ x: 3, y: 4 })).buildOrange(),
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 5 }))
				.buildBlue(),
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
		const tiles = PathFactory.round2;
		[castle, ...towers, ...tiles, ...barracks].map((e) => grid.setElement(e));
		return { army : new Army(grid, new Inventory()), randomSeed : 123456};
	},
	5: () => {
		const grid = new ArmyGrid(8, 5, undefined, 7);
		const castle = CastleFactory.round2;
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 5, y: 2 })).buildYellow(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen(),
			//new TowerBuilder().celled(new Cell({ x: 3, y: 4 })).buildOrange(),
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 5 }))
				.buildBlue(),
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
		const tiles = PathFactory.round2;
		[castle, ...towers, ...tiles, ...barracks].map((e) => grid.setElement(e));
		return { army : new Army(grid, new Inventory()), randomSeed : 123456};
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
