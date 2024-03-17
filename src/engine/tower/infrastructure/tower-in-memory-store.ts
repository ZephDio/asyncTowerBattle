import { Tower } from "../domain/tower"
import { TowerStore } from "../application/store/tower-store"

export class InMemoryTowerStore implements TowerStore {
  towers: Tower[] = []
  constructor(stored : Tower[] = []){
    this.towers = stored
  }

  async getAll(){
    return this.towers
  }
}