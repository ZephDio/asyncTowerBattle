import { GetPathQuery, GetPathQueryHandler } from "./path/applicative/query/get-path-query-handler";
import { GetTowersQuery, GetTowersQueryHandler } from "./tower/application/query/get-towers-query";
import { GetUnitsEntityQuery, GetUnitsEntityQueryHandler } from "./units/applicative/get-units-query-handler";


export class Game{
    constructor(public towerGetter : GetTowersQueryHandler, public pathGetter : GetPathQueryHandler, public enemyUnitsEntityGetter : GetUnitsEntityQueryHandler){}

    async getState(){
        const state = {
            towers : await this.towerGetter.handle(new GetTowersQuery()),
            path: await this.pathGetter.handle(new GetPathQuery()),
            enemyEntities: await this.enemyUnitsEntityGetter.handle(new GetUnitsEntityQuery())
        }
        return state
    }


}