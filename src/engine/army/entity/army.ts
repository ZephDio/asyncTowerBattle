import { Barrack } from "../../barrack/entity/barrack";
import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { Path } from "../../path/entity/path";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { Unit } from "../../units/entity/units";

export class Army {
  constructor(
    public castle: CastleRecruit<Castle>,
    public towers: TowerRecruit<Tower>[],
    public path: Path,
    public barracks: Barrack<Unit>[]
  ) {}
}