import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { GetTowersQueryHandler } from "./engine/tower/application/query/get-towers-query";
import { Tower } from "./engine/tower/domain/tower";
import { InMemoryTowerStore } from "./engine/tower/infrastructure/tower-in-memory-store";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";


async function init(){
    const towers = [new Tower({x : 50, y : 50 }, 'orange'),new Tower({x : 80, y : 80}, 'blue')]
    const towerStore = new InMemoryTowerStore(towers)
    const getTowersQueryHandler = new GetTowersQueryHandler(towerStore)
    const game = new Game(getTowersQueryHandler)
    const renderer = new CanvasRenderer(game)
    const inputToIntentTranslator = new InputToIntentTranslator(renderer)
    const mouseEventHandler = new MouseEventHandler(renderer,inputToIntentTranslator)
    
    renderer.init()
}

init()