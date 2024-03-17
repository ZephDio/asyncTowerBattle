import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { GetPathQueryHandler } from "./engine/path/applicative/query/get-path-query-handler";
import { Path, PathFixture } from "./engine/path/domain/path";
import { PathStoreInMemory } from "./engine/path/infrastructure/path-store";
import { GetTowersQueryHandler } from "./engine/tower/application/query/get-towers-query";
import { Tower, TowerFixtures } from "./engine/tower/domain/tower";
import { InMemoryTowerStore } from "./engine/tower/infrastructure/tower-in-memory-store";
import { GetUnitsEntityQueryHandler } from "./engine/units/applicative/get-units-query-handler";
import { UnitEntityFixture } from "./engine/units/domain/units";
import { UnitEntityStoreInMemory } from "./engine/units/infrastructure/unist-store-in-memory";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";


async function init(){
    const towers = [TowerFixtures.centerTower,TowerFixtures.topRightTower,TowerFixtures.BottomRightTower]
    const enemyEntities = [UnitEntityFixture.soldier]
    const towerStore = new InMemoryTowerStore(towers)
    const pathStore = new PathStoreInMemory(PathFixture.default)
    const enemyEntityStore =new UnitEntityStoreInMemory(enemyEntities)
    const getTowersQueryHandler = new GetTowersQueryHandler(towerStore)
    const getEnemyUnitEntityHandler = new GetUnitsEntityQueryHandler(enemyEntityStore)
    const getPathQueryHandler = new GetPathQueryHandler(pathStore)
    const game = new Game(getTowersQueryHandler,getPathQueryHandler,getEnemyUnitEntityHandler)
    const renderer = new CanvasRenderer(game)
    const inputToIntentTranslator = new InputToIntentTranslator(renderer)
    const mouseEventHandler = new MouseEventHandler(renderer,inputToIntentTranslator)
    
    renderer.init()
}

init()