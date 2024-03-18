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

export class Game {
  constructor(
    public towerGetter: GetTowersEntitiesQueryHandler,
    public pathGetter: GetPathQueryHandler,
    public enemyUnitsEntityGetter: GetUnitsEntityQueryHandler,
    public castleEntityGetter: GetCastleEntityQueryHandler,
  ) { }

  async getState() {
    const state = {
      castle: await this.castleEntityGetter.handle(new GetTowersEntitiesQuery()),
      towers: await this.towerGetter.handle(new GetTowersEntitiesQuery()),
      path: await this.pathGetter.handle(new GetPathQuery()),
      enemyEntities: await this.enemyUnitsEntityGetter.handle(
        new GetUnitsEntityQuery()
      ),
    };
    return state;
  }

  async start() {
    const entities = await this.enemyUnitsEntityGetter.handle(
      new GetUnitsEntityQuery()
    );
    const path = await this.pathGetter.handle(new GetPathQuery());
    const physics = new Physics(entities, path);
    const loop = () => {
      setTimeout(() => {
        this.tick(physics);
        loop();
      }, 31);
    };
    loop();
  }

  tick(physics: Physics) {
    physics.tick();
  }
}
