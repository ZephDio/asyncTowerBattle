import { Cell } from "../../shared/position";
import { BarrackRecruitFixtures } from "../barrack/recruit/barrack-recruit-fixtures";
import { CastleRecruitFixture } from "../castle/blueprint/castle";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFixture } from "../path/army/path-fixtures";
import { TowerBlueprintFixtures } from "../tower/blueprint/tower-fixtures";
import { AnyTower } from "../tower/recruit/tower-recruit";
import { TowerBuilder, TowerFixtures } from "../tower/recruit/tower-recruit-fixtures";
import { UnitRecruitFixture } from "../units/recruit/unit-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
	static get allied() {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.allied;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			TowerFixtures.centerTower,
			TowerFixtures.middleZappingTower,
			//TowerEntityFixtures.topRightTower,
		];
		const path = PathFixture.defaultAllied;
		const barracks = [
			BarrackRecruitFixtures.basicWithSoldier(4),
			BarrackRecruitFixtures.waveWithSoldier(),
			BarrackRecruitFixtures.basicWithPriest(),
		];
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.soldier, UnitRecruitFixture.priest];
		const unitInventory = new Inventory();
		unitInInventory.map((e) => unitInventory.add(e));
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		//return new Army(castle, towers, path, barracks, grid, unitInventory);
		return new Army(path, grid, unitInventory);
	}
	static get enemy() {
		const grid = new ArmyGrid();
		const towers = [
			new TowerBuilder().celled(new Cell({ x: 5, y: 5 })).buildBlue(TowerBlueprintFixtures.blue),
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildOrange(TowerBlueprintFixtures.orange),
			new TowerBuilder().celled(new Cell({ x: 4, y: 3 })).buildZapping(TowerBlueprintFixtures.zapping),
		];
		const castle = CastleRecruitFixture.enemy;
		const path = PathFixture.defaultAllied;
		const barracks = [BarrackRecruitFixtures.basicWithDragon(), BarrackRecruitFixtures.waveWithSoldier()];
		[castle, ...towers, ...barracks, ...path.tiles].map((e) => grid.setElement(e));
		return new Army(path, grid, new Inventory());
	}
}
