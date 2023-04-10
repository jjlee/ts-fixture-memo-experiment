import { AddCleanup, Cleanup } from "./Cleanups"

interface Factory<FT, N extends keyof FT> {
  (f: FixtureMemo<FT>): FT[N]
}

// The following two types are motivated by use of the "correlated union"
// feature of TS (https://github.com/Microsoft/TypeScript/issues/30581), to
// allow the return type of FixtureMemo.make to be determined by its `name`
// argument
type FactoryWithName<FT, K extends keyof FT> = {
  [N in K]: {
    name: N
    factory: Factory<FT, N>
  }
}[K]
export type FactoriesWithNameByName<FT> = { [N in keyof FT]: FactoryWithName<FT, N> }

// These types are motivated by making constructing FixtureMemo concise
export type FixturesObject<FT> = { [N in keyof FT]: Factory<FT, N> }
type AddedFixturesObject<FT, U> = { [K in keyof U]: (f: FixtureMemo<FT>) => U[K] }

type FixtureMemoWithProperties<FT> = FixtureMemo<FT> & { [K in keyof FT]: FT[K] }

type MadeFixtures = {
  [key: string]: any
}

export class AlreadyMade extends Error {}
export class NotMade extends Error {}

export class FixtureMemo<FT> {
  private made: MadeFixtures
  // correlatedFactories and factories are the same state.  correlatedFactories
  // is a cache whose purpose is only to make tsc infer the type of fixtures
  // returned by method `make` (and the properties that call that method): see
  // the comments about their types above
  private correlatedFactories: FactoriesWithNameByName<FT>
  private factories: FixturesObject<FT>
  private constructor(factories: FixturesObject<FT>, public addCleanup: AddCleanup) {
    this.made = {}
    this.factories = factories
    this.correlatedFactories = Object.fromEntries(
      Object.entries(factories).map(([n, f]) => [n, { name: n, factory: f }])
    ) as FactoriesWithNameByName<FT>
  }
  private static empty = new FixtureMemo<{}>({}, (_: Cleanup) => {});
  static from = FixtureMemo.empty.withFactories.bind(FixtureMemo.empty);
  withFactories<U>(factories: AddedFixturesObject<FT, U>): FixtureMemo<FT & U> {
    return new FixtureMemo({ ...this.factories, ...factories }, this.addCleanup) as any;
  }
  make<N extends keyof FT>(name: N): FT[N] {
    if (name in this.made) {
      return this.made[name as string]
    } else {
      const f = this.correlatedFactories[name]
      return f.factory(this)
    }
  }
  // Tried to have FixtureMemo itself implement this (by returning a Proxy from
  // the constructor) but ran into type inference limitations
  // https://github.com/Microsoft/TypeScript/issues/20846
  get props(): FixtureMemoWithProperties<FT> {
    return wrapWithProps(this)
  }
  partialCopy<N extends keyof FT>(names: N[]): FixtureMemo<FT> {
    let f = new FixtureMemo(this.factories, this.addCleanup)
    names.forEach((name) => f.set(name, this.make(name)))
    return f
  }
  set<N extends keyof FT>(name: N, value: FT[N]) {
    if (name in this.made) {
      throw new AlreadyMade(JSON.stringify(name))
    } else {
      this.made[name as string] = value
    }
  }
}

const wrapWithProps = <FT>(c: FixtureMemo<FT>): FixtureMemoWithProperties<FT> => {
  return new Proxy(
    c,
    {
      get<N extends keyof FT>(target: FixtureMemo<FT>, name: N) {
        return target.make(name)
      }
    } as ProxyHandler<FixtureMemo<FT>>
  ) as any
}
