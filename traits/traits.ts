// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Constructor<Props = any, Result extends {} = {}> = new (props: Props) => Result;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type AbstractConstructor<Props = any, Result extends {} = {}> = abstract new (props: Props) => Result;

export type Trait<Factory extends <Base extends AbstractConstructor>(base: Base) => AbstractConstructor = any> = {
  factory: Factory;
  superTraits: Trait<any>[];
  symbol: symbol;
};

type Explode<T> = { [P in keyof T]: T[P] };

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type MergeStaticSide<T extends Trait[]> = UnionToIntersection<Explode<ReturnType<[...T][number]["factory"]>>>;

export type MergeInstanceSide<T extends Trait[]> = T extends []
  ? // biome-ignore lint/complexity/noBannedTypes: <explanation>
    {}
  : T extends never[]
  ? // biome-ignore lint/complexity/noBannedTypes: <explanation>
    {}
  : UnionToIntersection<InstanceType<ReturnType<[...T][number]["factory"]>>>;

export type MergeParameter<T extends Trait[]> = T extends []
  ? // biome-ignore lint/complexity/noBannedTypes: <explanation>
    {}
  : T extends never[]
  ? // biome-ignore lint/complexity/noBannedTypes: <explanation>
    {} // biome-ignore lint/complexity/noBannedTypes: <explanation>
  : ConstructorParameters<ReturnType<[...T][number]["factory"]>>[0] extends {}
  ? UnionToIntersection<ConstructorParameters<ReturnType<[...T][number]["factory"]>>[0]>
  : ConstructorParameters<ReturnType<[...T][number]["factory"]>>[0];

export type ApplyTraits<T extends Trait[]> = {
  new (param: MergeParameter<T>): MergeInstanceSide<T>;
} & MergeStaticSide<T>;

export type CheckTraitRequirements<Traits extends Trait[]> = CheckTraitRequirementsInternal<[], Traits>;

type CheckTraitRequirementsInternal<AppliedTraits extends Trait[], RemainingTraits extends Trait[]> = RemainingTraits extends [
  infer ApplyingTrait extends Trait,
  ...infer Rest extends Trait[]
]
  ? MergeParameter<AppliedTraits> extends MergeParameter<ApplyingTrait["superTraits"]>
    ? MergeInstanceSide<AppliedTraits> extends MergeInstanceSide<ApplyingTrait["superTraits"]>
      ? CheckTraitRequirementsInternal<[...AppliedTraits, ApplyingTrait], Rest>
      : {
          error: "Instance mismatch";
          check: "MergeInstanceSide<AppliedTraits> extends MergeInstanceSide<ApplyingTrait['superTraits']>";
          left: MergeInstanceSide<AppliedTraits>;
          right: MergeInstanceSide<ApplyingTrait["superTraits"]>;
          result: MergeInstanceSide<AppliedTraits> extends MergeInstanceSide<ApplyingTrait["superTraits"]> ? true : false;
        }
    : {
        error: "Parameter mismatch";
        check: "MergeParameter<AppliedTraits> extends MergeParameter<[ApplyingTrait]>";
        left: MergeParameter<AppliedTraits>;
        right: MergeParameter<[ApplyingTrait]>;
        result: MergeParameter<AppliedTraits> extends MergeParameter<[ApplyingTrait]> ? true : false;
      }
  : "success";

export function Subtrait<
  const SuperTraits extends Trait[],
  Applied extends ApplyTraits<SuperTraits>,
  const Factory extends (base: Applied, props: ConstructorParameters<Applied>[0]) => AbstractConstructor
>(superTraits: SuperTraits, factory: Factory) {
  const symbol = Symbol();
  return {
    factory,
    superTraits,
    symbol,
  };
}

export type Props<T extends { __traits_props__: any } | Trait | Trait[]> = T extends {
  __traits_props__: any;
}
  ? T["__traits_props__"]
  : T extends Trait
  ? MergeParameter<[T]>
  : T extends Trait[]
  ? MergeParameter<T>
  : never;

function InnerDerive<R extends Trait[]>(traits: R, base: Constructor) {
  let current: Constructor = base;
  for (const trait of traits) {
    console.log(trait);
    if ((current as any)[trait.symbol]) {
      continue;
    }
    current = InnerDerive(trait.superTraits, current) as any;
    current = trait.factory(current);
    (current as any)[trait.symbol] = true;
  }

  return current;
}

export function Derive<R extends Trait[]>(...traits: R): ApplyTraits<R> & { __traits__: R; __traits_props__: MergeParameter<R> } {
  return InnerDerive(traits, class {}) as any;
}
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const Trait = <T extends (base: AbstractConstructor<{}, {}>) => AbstractConstructor<any, any>>(factory: T) => {
  const symbol = Symbol();
  return { factory, superTraits: [] as Trait[], symbol };
};

export function implementsTrait<I extends InstanceType<any>, T extends Trait>(instance: I, trait: T): instance is ImplementsTrait<T> {
  return (instance as any).constructor[trait.symbol] === true;
}

export type HasTrait<T extends Trait> = ReturnType<T["factory"]>;

export type ImplementsTrait<T extends Trait> = InstanceType<ReturnType<T["factory"]>>;

export const WithProps = <P extends Record<string, any>>() =>
  Trait((base) => {
    class Intermediate extends base {}
    type I = typeof Intermediate extends new (...args: infer A) => infer T ? new (...args: A) => T & P : never;
    return Intermediate as typeof Intermediate & I;
  });
