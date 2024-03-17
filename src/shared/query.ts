export abstract class Query{}

export abstract class QueryHandler{
    abstract handle(query : Query) : Promise<any>
}