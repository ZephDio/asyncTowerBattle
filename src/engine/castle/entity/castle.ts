import { CastleRecruit } from "../recruit/castle-recruit";

type Team = "allied" | "enemy";

export class Castle {
  constructor(public team: Team) {}
}

export class CastleEntityFixture {
  static allied = new CastleRecruit(new Castle("allied"));
  static enemy = new CastleRecruit(new Castle("enemy"));
}
