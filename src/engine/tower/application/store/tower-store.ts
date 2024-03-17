import { Tower } from "../../domain/tower";

export interface TowerStore {
  getAll() : Promise<Tower[]>
}