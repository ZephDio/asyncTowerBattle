import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { Path, PathFixture } from "./engine/path/domain/path";
import { Castle, CastleRecruit } from "./engine/castle/domain/castle";
import { GetTowersEntitiesQueryHandler } from "./engine/tower/application/query/get-towers-query";
import { TowerRecruit, TowerEntityFixtures } from "./engine/tower/domain/tower";
import { InMemoryTowerStore } from "./engine/tower/infrastructure/tower-in-memory-store";
import { UnitEntityFixture } from "./engine/units/domain/units";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";

async function init() {
  const towers = [
    TowerEntityFixtures.centerTower,
    TowerEntityFixtures.topRightTower,
    TowerEntityFixtures.BottomLeftTower,
  ];
  const enemyEntities = [UnitEntityFixture.soldier];
  const castle = [
    new CastleRecruit(new Castle("allied")),
    new CastleRecruit(new Castle("enemy")),
  ];
  const game = new Game();
  const renderer = new CanvasRenderer(game);
  const inputToIntentTranslator = new InputToIntentTranslator(renderer);
  const mouseEventHandler = new MouseEventHandler(
    renderer,
    inputToIntentTranslator
  );

  game.startBattle();
  renderer.init();
}

init();
