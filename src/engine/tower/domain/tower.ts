import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";

import { HitBox, HitShape } from "../../../shared/hitboxes";
import { Position, getDistance } from "../../../shared/position";
import { PhysicEntity, Recruit } from "../../physic/physic";
import {
  BattleTower,
  BlueBattleTower,
  GreenBattleTower,
  OrangeBattleTower,
} from "../../physic/tower/entity-tower-physic";
import { Unit, UnitRecruit } from "../../units/domain/units";

export abstract class Tower {
  abstract type: "orange" | "blue" | "green";
  abstract hitbox: HitBox;
  clone() {
    switch (this.type) {
      case "orange":
        return new OrangeTower();
      case "blue":
        return new BlueTower();
      case "green":
        return new GreenTower();
    }
  }
}

export class BlueTower extends Tower {
  type = "blue" as const;
  hitbox = BlueTower.hitbox;
  static hitbox = new HitBox([
    [new HitShape("ellipse", { width: 5, height: 10 }), { x: 0, y: 0 }],
  ]);
}
export class GreenTower extends Tower {
  type = "green" as const;

  hitbox = GreenTower.hitbox;
  static hitbox = new HitBox([
    [new HitShape("rectangle", { width: 4, height: 6 }), { x: 0, y: 0 }],
  ]);
}
export class OrangeTower extends Tower {
  type = "orange" as const;
  hitbox = OrangeTower.hitbox;
  static hitbox = new HitBox([
    [new HitShape("ellipse", { width: 5, height: 5 }), { x: 0, y: 0 }],
  ]);
}

export abstract class TowerRecruit<T extends Tower> implements Recruit {
  abstract type: T["type"];
  abstract hitbox: HitBox;
  abstract attackSpeed: number;
  abstract attackDamage: number;
  abstract position: Position;
  abstract tower: T;

  abstract matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>): boolean
  abstract toPhysic(): BattleTower<TowerRecruit<T>>;
  abstract clone(): TowerRecruit<T>;
}

export class BlueTowerRecruit extends TowerRecruit<BlueTower> {
  attackDamage = 6;
  attackSpeed = 3;
  type = "blue" as const;
  hitbox = BlueTower.hitbox;

  constructor(public position: Position, public tower: BlueTower) {
    super();
  }
  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 20
  }

  toPhysic(): BlueBattleTower {
    return new BlueBattleTower(this.clone());
  }

  clone() {
    return new BlueTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new BlueTower()
    );
  }
}

export class OrangeTowerRecruit extends TowerRecruit<OrangeTower> {
  attackDamage = 6
  attackSpeed = 3;
  type = "orange" as const;
  hitbox = OrangeTower.hitbox;

  constructor(public position: Position, public tower: OrangeTower) {
    super();
  }

  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 35
  }

  toPhysic(): OrangeBattleTower {
    return new OrangeBattleTower(this.clone());
  }

  clone() {
    return new OrangeTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new OrangeTower()
    );
  }
}

export class GreenTowerRecruit extends TowerRecruit<GreenTower> {
  attackDamage = 10;
  attackSpeed = 3;
  type = "green" as const;
  hitbox = GreenTower.hitbox;

  constructor(public position: Position, public tower: GreenTower) {
    super();
  }
  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return enemyUnit.isAlive() && getDistance(enemyUnit.position, this.position) < 10
  }


  toPhysic(): GreenBattleTower {
    return new GreenBattleTower(this.clone());
  }

  clone() {
    return new GreenTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new GreenTower()
    );
  }
}
export class TowerEntityFixtures {
  static centerTower = new BlueTowerRecruit(
    PercentToReal({ x: 50, y: 50 }),
    new BlueTower()
  );
  static topRightTower = new OrangeTowerRecruit(
    PercentToReal({ x: 80, y: 80 }),
    new OrangeTower()
  );
  static BottomLeftTower = new GreenTowerRecruit(
    PercentToReal({ x: 30, y: 30 }),
    new GreenTower()
  );
}
