import { Query, QueryHandler } from "../../../../shared/query";
import { TowerStore } from "../store/tower-store";

export class GetTowersQuery implements Query{}

export class GetTowersQueryHandler implements QueryHandler<GetTowersQuery>{
  constructor(private readonly towerStore : TowerStore){}

  async handle(query: GetTowersQuery){
    const towers = await this.towerStore.getAll()
    return towers
  }
}

