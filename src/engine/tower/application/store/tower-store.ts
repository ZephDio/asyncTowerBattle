import { Tower, TowerRecruit } from "../../domain/tower";

export interface TowerStore {
  getAll(): Promise<TowerRecruit<Tower>[]>;
}
