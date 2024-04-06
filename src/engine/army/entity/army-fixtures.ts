import { Cell } from "../../../shared/position";
import { BarrackRecruitFixtures } from "../../barrack/recruit/barrack-recruit-fixtures";
import { CastleRecruitFixture } from "../../castle/entity/castle";
import { ArmyGrid } from "../../grid/grid";
import { UnitInventory } from "../../grid/inventory/unit-inventory";
import { PathFixture } from "../../path/entity/path-fixtures";
import { TowerFixtures } from "../../tower/entity/tower-fixtures";
import { AnyTowerRecruit } from "../../tower/recruit/tower-recruit";
import { TowerRecruitBuilder, TowerRecruitFixtures } from "../../tower/recruit/tower-recruit-fixtures";
import { UnitRecruitFixture } from "../../units/recruit/unit-recruit-fixtures";
import { Army } from "./army";

export class ArmyFixture {
	static get allied() {
		const grid = new ArmyGrid();
		const castle = CastleRecruitFixture.allied;
		const towers: AnyTowerRecruit[] = [
			//TowerFixtures.centerTower,
			TowerRecruitFixtures.centerTower,
			//TowerEntityFixtures.topRightTower,
		];
		const path = PathFixture.defaultAllied;
		const barracks = [BarrackRecruitFixtures.basicWithSoldier(4), BarrackRecruitFixtures.waveWithSoldier()] as any;
		const unitInInventory = [UnitRecruitFixture.dragon, UnitRecruitFixture.soldier];
		const unitInventory = new UnitInventory();
		unitInInventory.map((e) => unitInventory.addUnit(e));
		[castle, ...towers, ...path.tiles, ...barracks].map((e) => grid.setElement(e));
		return new Army(castle, towers, path, grid, barracks, unitInInventory, unitInventory);
	}
	static get enemy() {
		const grid = new ArmyGrid();
		const towers = [
			new TowerRecruitBuilder().celled(new Cell({ x: 5, y: 5 })).buildBlue(TowerFixtures.blue),
			new TowerRecruitBuilder().celled(new Cell({ x: 4, y: 4 })).buildOrange(TowerFixtures.orange),
			new TowerRecruitBuilder().celled(new Cell({ x: 4, y: 3 })).buildGreen(TowerFixtures.green),
		];
		const castle = CastleRecruitFixture.enemy;
		const path = PathFixture.defaultAllied;
		[castle, ...towers, ...path.tiles].map((e) => grid.setElement(e));

		return new Army(
			castle,
			towers,
			path,
			grid,
			//[]
			[
				BarrackRecruitFixtures.basicWithSoldier(4),
				BarrackRecruitFixtures.basicWithDragon(),
				// BarrackRecruitFixtures.basicWithDragon(34),
				// BarrackRecruitFixtures.basicWithDragon(25),
				// BarrackRecruitFixtures.basicWithDragon(20),
				// BarrackRecruitFixtures.basicWithDragon(50),
			],
			[],
			new UnitInventory(),
		);
	}
}
