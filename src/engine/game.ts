import { GetTowersQuery, GetTowersQueryHandler } from "./tower/application/query/get-towers-query";


export class Game{
    constructor(public towerGetter : GetTowersQueryHandler){}

    async getState(){
        const state = {
            towers : await this.towerGetter.handle(new GetTowersQuery())
        }
        return state
    }

}