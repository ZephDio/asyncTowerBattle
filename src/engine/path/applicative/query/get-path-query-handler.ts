import { Query, QueryHandler } from "../../../../shared/query";
import { PathStore } from "../store/path-store";

export class GetPathQuery implements Query{}
export class GetPathQueryHandler implements QueryHandler<GetPathQuery>{
    constructor(public pathStore : PathStore){}
    async handle(query : GetPathQuery){
        return this.pathStore.getPath()
    }
}