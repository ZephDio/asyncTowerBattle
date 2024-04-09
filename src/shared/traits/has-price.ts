import { Trait } from "@ddd-ts/traits";

export const THasPrice = Trait((base) => {
    abstract class IHasPrice extends base {
        price: number;
    }
    return IHasPrice;
})