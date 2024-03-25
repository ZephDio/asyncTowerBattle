import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";
import { BlueTower } from "../entity/implementation/blue-tower";
import { GreenTower } from "../entity/implementation/green-tower";
import { OrangeTower } from "../entity/implementation/orange-tower";
import { Position } from "../../../shared/position";
import { TowerFixtures } from "../entity/tower-fixtures";

export class TowerRecruitBuilder {
  position: Position
  positioned(position: Position){
    this.position = PercentToReal(position)
    return this
  }
  buildBlue(tower: BlueTower){
    return new BlueTowerRecruit(this.position, tower)
  }
  buildGreen(tower: GreenTower){
    return new GreenTowerRecruit(this.position, tower)
  }
  buildOrange(tower: OrangeTower){
    return new OrangeTowerRecruit(this.position, tower)
  }
}

export class TowerRecruitFixtures {
  static get centerTower(){
    return new TowerRecruitBuilder().positioned({ x: 75, y: 30 }).buildBlue(TowerFixtures.blue)
  } 
  static get topRightTower(){
    return new TowerRecruitBuilder().positioned({ x: 80, y: 80 }).buildOrange(TowerFixtures.orange);
  } 
  static get bottomLeftTower(){
    return new TowerRecruitBuilder().positioned({ x: 30, y: 20 }).buildGreen(TowerFixtures.green)
  } 
  static get bottomMiddleTower(){
    return new TowerRecruitBuilder().positioned({ x: 50, y: 38 }).buildGreen(TowerFixtures.green)
  } 
}
