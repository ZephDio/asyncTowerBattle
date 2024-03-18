import { Query, QueryHandler } from "../../../../shared/query";
import { TowerStore } from "../store/tower-store";

export class GetTowersEntitiesQuery implements Query { }

export class GetTowersEntitiesQueryHandler implements QueryHandler<GetTowersEntitiesQuery>{
  constructor(private readonly towerStore: TowerStore) { }

  async handle(query: GetTowersEntitiesQuery) {
    const towers = await this.towerStore.getAll()
    return towers
  }
}

