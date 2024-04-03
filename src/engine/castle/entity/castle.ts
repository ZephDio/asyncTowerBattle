import { Derive } from "@ddd-ts/traits";
import { TImageDrawable } from "../../../shared/traits/drawable";
import { CastleRecruit } from "../recruit/castle-recruit";
import { Resources } from "../../../renderer/resources";

export class Castle extends Derive(TImageDrawable(Resources.castle.resource.image, Resources.castle.size, 3)) {
  maxLife = 20;
}

export class CastleRecruitFixture {
  static get allied() {
    return new CastleRecruit(new Castle({}));
  }
  static get enemy() {
    return new CastleRecruit(new Castle({}));
  }
}
