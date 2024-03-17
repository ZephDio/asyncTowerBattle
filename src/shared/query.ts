export abstract class Query{}

export abstract class QueryHandler<Q extends Query>{
    abstract handle(query : Q) : Promise<any>
}