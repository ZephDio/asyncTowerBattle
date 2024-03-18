import { Query, QueryHandler } from "../../../../shared/query";
import { TowerBaseEntityStore } from "../store/tower-base-entity-store";

export class GetTowerBaseEntityQuery implements Query { }

export class GetTowerBaseEntityQueryHandler implements QueryHandler<GetTowerBaseEntityQuery>{

    constructor(public store: TowerBaseEntityStore) { }
    async handle(query: GetTowerBaseEntityQuery) {
        return await this.store.getAll()
    }
}