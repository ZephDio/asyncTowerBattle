import { Cell } from "../../shared/position";
import { BarrackRecruitFixtures } from "../constructs/barrack/recruit/barrack-fixtures";
import { CastleFactory, CastleFixture } from "../castle/recruit/castle-recruit-fixtures";
import { ArmyGrid } from "../grid/grid";
import { armyGridSize } from "../grid/grid-sizes";
import { Inventory } from "../grid/inventory/unit-inventory";
import { Faction } from "../menu/main-menu";
import { PathFactory, PathFixture } from "../path/army/path-fixtures";
import { TotemBuilder } from "../constructs/totem/recruit/totem-fixtures";
import { TowerBlueprintFixtures } from "../constructs/tower/blueprint/tower-fixtures";
import { AnyTower } from "../constructs/tower/recruit/tower";
import { TowerBuilder } from "../constructs/tower/recruit/tower-fixtures";
import { DwarfBlueprint } from "../units/blueprint/implementation/dwarf-blueprint";
import { ElfBlueprint } from "../units/blueprint/implementation/elf-blueprint";
import { UnitRecruitFixture } from "../units/recruit/unit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
	static get pacifist() {
		const grid = new ArmyGrid(6, 4, undefined, 7);
		const castle = CastleFactory.defaultDwarf;
		const towers: AnyTower[] = [];
		const tiles = PathFactory.default;
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.choupisson, UnitRecruitFixture.whiteStag];
		const unitInventory = new Inventory();
		unitInInventory.map((e) => unitInventory.add(e));
		[castle, ...towers, ...tiles].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(grid, unitInventory, new DwarfBlueprint({}));
	}
	static get allied() {
		const grid = new ArmyGrid(7, 5);
		const castle = CastleFactory.defaultDwarf;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 0, y: 1 })).buildFrost(),
			//TowerEntityFixtures.topRightTower,
		];
		const totems = [new TotemBuilder().celled(new Cell({ x: 3, y: 2 })).buildOrange()];
		const tiles = PathFactory.default;
		const barracks = [BarrackRecruitFixtures.veterantWithDragon()];
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.choupisson, UnitRecruitFixture.whiteStag];
		const unitInventory = new Inventory();
		unitInInventory.map((e) => unitInventory.add(e));
		[castle, ...towers, ...tiles, ...totems, ...barracks].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(grid, unitInventory, new DwarfBlueprint({}));
	}
	static get enemy() {
		const grid = new ArmyGrid();
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 5, y: 5 })).buildBlacksmith(TowerBlueprintFixtures.blacksmith),
			//new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildOrange(TowerBlueprintFixtures.orange),
			new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildZapping(TowerBlueprintFixtures.zapping),
		];
		const castle = CastleFixture.enemy;
		const tiles = PathFixture.default;
		const barracks = [BarrackRecruitFixtures.basicWithDragon(), BarrackRecruitFixtures.waveWithSoldier()];
		[castle, ...towers, ...barracks, ...tiles].map((e) => grid.setElement(e));
		return new Army(grid, new Inventory(), new DwarfBlueprint({}));
	}
}

export class ArmyFactory {
	static default(classe: Faction) {
		if (classe === Faction.Dwarf) {
			const grid = ArmyGrid.sized(armyGridSize(1));
			const castle = CastleFactory.defaultDwarf;
			const tiles = PathFactory.default;
			const unitInventory = new Inventory();
			[castle, ...tiles].map((e) => grid.setElement(e));
			return new Army(grid, unitInventory, new DwarfBlueprint({}));
		}
		if (classe === Faction.Elf) {
			const grid = ArmyGrid.sized(armyGridSize(1));
			const castle = CastleFactory.defaultElf;
			const tiles = PathFactory.default;
			const unitInventory = new Inventory();
			[castle, ...tiles].map((e) => grid.setElement(e));
			return new Army(grid, unitInventory, new ElfBlueprint({}));
		}
		throw new Error("Invalid class");
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
