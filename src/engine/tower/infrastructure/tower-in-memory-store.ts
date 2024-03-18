import { TowerEntity } from "../domain/tower"
import { TowerStore } from "../application/store/tower-store"

export class InMemoryTowerStore implements TowerStore {
  towers: TowerEntity[] = []
  constructor(stored: TowerEntity[] = []) {
    this.towers = stored
  }

  async getAll() {
    return this.towers
  }
}