import { Tower, TowerEntity } from "../domain/tower"
import { TowerStore } from "../application/store/tower-store"

export class InMemoryTowerStore implements TowerStore {
  towers: TowerEntity<Tower>[] = []
  constructor(stored: TowerEntity<Tower>[] = []) {
    this.towers = stored
  }

  async getAll() {
    return this.towers
  }
}