import { TowerEntity } from "../../domain/tower";

export interface TowerStore {
  getAll(): Promise<TowerEntity[]>
}