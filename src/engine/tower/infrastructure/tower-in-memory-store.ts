import { Tower, TowerRecruit } from "../domain/tower";
import { TowerStore } from "../application/store/tower-store";

export class InMemoryTowerStore implements TowerStore {
  towers: TowerRecruit<Tower>[] = [];
  constructor(stored: TowerRecruit<Tower>[] = []) {
    this.towers = stored;
  }

  async getAll() {
    return this.towers;
  }
}
