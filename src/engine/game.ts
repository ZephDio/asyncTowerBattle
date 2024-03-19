import {
  GetPathQuery,
  GetPathQueryHandler,
} from "./path/applicative/query/get-path-query-handler";
import { Physics } from "./physic/physics";
import { GetCastleEntityQueryHandler } from "./castle/applicative/query/get-tower-base";
import {
  GetTowersEntitiesQuery,
  GetTowersEntitiesQueryHandler,
} from "./tower/application/query/get-towers-query";
import {
  GetUnitsEntityQuery,
  GetUnitsEntityQueryHandler,
} from "./units/applicative/get-units-query-handler";
import { Battle } from "./battle/battle";
import { Army, ArmyFixture } from "./army/army";
import { GameState } from "../shared/gamestate";

export class Game {
  battle = null as null | Battle
  constructor(
    public towerGetter: GetTowersEntitiesQueryHandler,
    public pathGetter: GetPathQueryHandler,
    public enemyUnitsEntityGetter: GetUnitsEntityQueryHandler,
    public castleEntityGetter: GetCastleEntityQueryHandler,
  ) { }

  async getState(): Promise<GameState> {
    if (this.battle) {
      const battleState = {
        castles: [this.battle.alliedArmy.castle, this.battle.enemyArmy.castle],
        towers: [...this.battle.alliedArmy.towers, ...this.battle.enemyArmy.towers],
        paths: [this.battle.alliedArmy.path, this.battle.enemyArmy.path],
        enemyEntities: [...this.battle.physics.units]
      }
      return battleState
    }

    const state = {
      castles: await this.castleEntityGetter.handle(new GetTowersEntitiesQuery()),
      towers: await this.towerGetter.handle(new GetTowersEntitiesQuery()),
      paths: [await this.pathGetter.handle(new GetPathQuery())],
      enemyEntities: []
    };
    return state;
  }

  async startBattle() {

    this.battle = new Battle(ArmyFixture.allied, ArmyFixture.enemy)
    this.battle.start()
  }

}
