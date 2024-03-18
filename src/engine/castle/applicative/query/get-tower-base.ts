import { Query, QueryHandler } from "../../../../shared/query";
import { CastleEntityStore } from "../store/tower-base-entity-store";

export class GetCastleEntityQuery implements Query { }

export class GetCastleEntityQueryHandler implements QueryHandler<GetCastleEntityQuery>{

    constructor(public store: CastleEntityStore) { }
    async handle(query: GetCastleEntityQuery) {
        return await this.store.getAll()
    }
}