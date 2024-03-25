import { CastleFixtures } from "../entity/castle-fixtures";
import { CastleRecruit } from "./castle-recruit";

export class CastleRecruitFixture {
    static get allied(){
      return new CastleRecruit(CastleFixtures.allied);
    }
    static get enemy(){
      return new CastleRecruit(CastleFixtures.enemy);
    }
  }
  