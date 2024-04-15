import { Cell } from "../../shared/position";
import { BarrackRecruitFixtures } from "../barrack/recruit/barrack-recruit-fixtures";
import { CastleFactory, CastleRecruitFixture } from "../castle/blueprint/castle";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFactory, PathFixture } from "../path/army/path-fixtures";
import { TowerBlueprintFixtures } from "../tower/blueprint/tower-fixtures";
import { AnyTower } from "../tower/recruit/tower-recruit";
import { TowerBuilder, TowerFixtures } from "../tower/recruit/tower-recruit-fixtures";
import { UnitRecruitFixture } from "../units/recruit/unit-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
	static get pacifist() {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.allied;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildGreen(TowerBlueprintFixtures.green),
			new TowerBuilder()
				.celled(new Cell({ x: 7, y: 4 }))
				.buildFrost(),
			//TowerEntityFixtures.topRightTower,
		];
		const tiles = PathFixture.default;
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.soldier, UnitRecruitFixture.priest];
		const unitInventory = new Inventory();
		unitInInventory.map((e) => unitInventory.add(e));
		[castle, ...towers, ...tiles].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(grid, unitInventory);
	}
	static get allied() {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.allied;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 0, y: 1 }))
				.buildFrost(),
			//TowerEntityFixtures.topRightTower,
		];
		const tiles = PathFixture.default;
		const barracks = [BarrackRecruitFixtures.veterantWithDragon()];
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.soldier, UnitRecruitFixture.priest];
		const unitInventory = new Inventory();
		unitInInventory.map((e) => unitInventory.add(e));
		[castle, ...towers, ...tiles, ...barracks].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(grid, unitInventory);
	}
	static get enemy() {
		const grid = new ArmyGrid();
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 5, y: 5 })).buildBlue(TowerBlueprintFixtures.blue),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildOrange(TowerBlueprintFixtures.orange),
			new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildZapping(TowerBlueprintFixtures.zapping),
		];
		const castle = CastleRecruitFixture.enemy;
		const tiles = PathFixture.default;
		const barracks = [BarrackRecruitFixtures.basicWithDragon(), BarrackRecruitFixtures.waveWithSoldier()];
		[castle, ...towers, ...barracks, ...tiles].map((e) => grid.setElement(e));
		return new Army(grid, new Inventory());
	}
}

export class ArmyFactory {
	static get default(){
		const grid = new ArmyGrid( 6, 4 , undefined, 7);
		const castle = CastleFactory.default;
		const tiles = PathFactory.default;
		const unitInventory = new Inventory();
		[castle, ...tiles].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(grid, unitInventory);
	}
}

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
