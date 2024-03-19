import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { GetPathQueryHandler } from "./engine/path/applicative/query/get-path-query-handler";
import { Path, PathFixture } from "./engine/path/domain/path";
import { PathStoreInMemory } from "./engine/path/infrastructure/path-store";
import {
  GetCastleEntityQuery,
  GetCastleEntityQueryHandler,
} from "./engine/castle/applicative/query/get-tower-base";
import { Castle, CastleRecruit } from "./engine/castle/domain/castle";
import { CastleEntityStoreInMemory } from "./engine/castle/infrastructure/tower-base-store-in-memory";
import { GetTowersEntitiesQueryHandler } from "./engine/tower/application/query/get-towers-query";
import { TowerRecruit, TowerEntityFixtures } from "./engine/tower/domain/tower";
import { InMemoryTowerStore } from "./engine/tower/infrastructure/tower-in-memory-store";
import { GetUnitsEntityQueryHandler } from "./engine/units/applicative/get-units-query-handler";
import { UnitEntityFixture } from "./engine/units/domain/units";
import { UnitEntityStoreInMemory } from "./engine/units/infrastructure/unist-store-in-memory";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";

async function init() {
  const towers = [
    TowerEntityFixtures.centerTower,
    TowerEntityFixtures.topRightTower,
    TowerEntityFixtures.BottomRightTower,
  ];
  const enemyEntities = [UnitEntityFixture.soldier];
  const castle = [
    new CastleRecruit(new Castle("allied")),
    new CastleRecruit(new Castle("enemy")),
  ];
  const castleEntityStore = new CastleEntityStoreInMemory(castle);
  const towerStore = new InMemoryTowerStore(towers);
  const pathStore = new PathStoreInMemory(PathFixture.defaultAllied);
  const enemyEntityStore = new UnitEntityStoreInMemory(enemyEntities);

  const getTowersQueryHandler = new GetTowersEntitiesQueryHandler(towerStore);
  const getEnemyUnitEntityHandler = new GetUnitsEntityQueryHandler(
    enemyEntityStore
  );
  const getPathQueryHandler = new GetPathQueryHandler(pathStore);
  const getCastleEntityQueryHandler = new GetCastleEntityQueryHandler(
    castleEntityStore
  );
  const game = new Game(
    getTowersQueryHandler,
    getPathQueryHandler,
    getEnemyUnitEntityHandler,
    getCastleEntityQueryHandler
  );
  const renderer = new CanvasRenderer(game);
  const inputToIntentTranslator = new InputToIntentTranslator(renderer);
  const mouseEventHandler = new MouseEventHandler(
    renderer,
    inputToIntentTranslator
  );

  renderer.init();
  game.startBattle();
}

init();
