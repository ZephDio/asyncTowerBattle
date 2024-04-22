import { Trait } from "@ddd-ts/traits";

export const TFoodTag = Trait((base) => {
    abstract class TFoodTag extends base {
        foodTag= true;
    }
    return TFoodTag;
})