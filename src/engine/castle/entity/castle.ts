import { CastleRecruit } from "../recruit/castle-recruit";

type Team = "allied" | "enemy";

export class Castle {
	constructor(public team: Team) {}
}

export class CastleRecruitFixture {
	static get allied() {
		return new CastleRecruit(new Castle("allied"));
	}
	static get enemy() {
		return new CastleRecruit(new Castle("enemy"));
	}
}
