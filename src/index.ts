import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { GetPathQueryHandler } from "./engine/path/applicative/query/get-path-query-handler";
import { Path, PathFixture } from "./engine/path/domain/path";
import { PathStoreInMemory } from "./engine/path/infrastructure/path-store";
import { GetTowerBaseEntityQuery, GetTowerBaseEntityQueryHandler } from "./engine/tower-base/applicative/query/get-tower-base";
import { TowerBase, TowerBaseEntity } from "./engine/tower-base/domain/tower-base";
import { TowerBaseEntityStoreInMemory } from "./engine/tower-base/infrastructure/tower-base-store-in-memory";
import { GetTowersEntitiesQueryHandler } from "./engine/tower/application/query/get-towers-query";
import { TowerEntity, TowerEntityFixtures } from "./engine/tower/domain/tower";
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
  const enemyEntities = [
    UnitEntityFixture.soldier,
    UnitEntityFixture.soldier2,
    UnitEntityFixture.soldier3,
    UnitEntityFixture.soldier4,
    UnitEntityFixture.soldier5,
    UnitEntityFixture.soldier6,
    UnitEntityFixture.soldier7,
  ];
  const towerBase = [new TowerBaseEntity(new TowerBase('allied')), new TowerBaseEntity(new TowerBase('enemy'))]
  const towerBaseEntityStore = new TowerBaseEntityStoreInMemory(towerBase)
  const towerStore = new InMemoryTowerStore(towers);
  const pathStore = new PathStoreInMemory(PathFixture.default);
  const enemyEntityStore = new UnitEntityStoreInMemory(enemyEntities);

  const getTowersQueryHandler = new GetTowersEntitiesQueryHandler(towerStore);
  const getEnemyUnitEntityHandler = new GetUnitsEntityQueryHandler(
    enemyEntityStore
  );
  const getPathQueryHandler = new GetPathQueryHandler(pathStore);
  const getTowerBaseEntityQueryHandler = new GetTowerBaseEntityQueryHandler(towerBaseEntityStore)
  const game = new Game(
    getTowersQueryHandler,
    getPathQueryHandler,
    getEnemyUnitEntityHandler,
    getTowerBaseEntityQueryHandler
  );
  const renderer = new CanvasRenderer(game);
  const inputToIntentTranslator = new InputToIntentTranslator(renderer);
  const mouseEventHandler = new MouseEventHandler(
    renderer,
    inputToIntentTranslator
  );

  renderer.init();
  game.start();
}

init();
