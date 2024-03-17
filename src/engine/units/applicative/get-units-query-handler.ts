import { Query, QueryHandler } from "../../../shared/query";
import { UnitEntityStore } from "./store/unit-store";

export class GetUnitsEntityQuery implements Query{
    
}
export class GetUnitsEntityQueryHandler implements QueryHandler<GetUnitsEntityQuery>{
    constructor(public unitStore : UnitEntityStore){}
    async handle(query : GetUnitsEntityQuery){
        return this.unitStore.getAll()
    }
}