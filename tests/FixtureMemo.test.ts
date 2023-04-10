import { FixtureMemo } from "../src/FixtureMemo"

describe("FixtureMemo", () => {
  test("simple", () => {
    const f = FixtureMemo.from({foo: () => 123})
      .withFactories({
        thing: (f) => {
          const x = f.props.foo
          return { size: x }
        }
      })
    const foo = f.props.foo
    expect(foo).toEqual(123)
  })

  test("hierarchy with set", () => {
    let f = FixtureMemo.from({ color: () => "red" })
      .withFactories({
        door: (f) => ({ color: f.props.color }),
      })
      .withFactories({
        house: (f) => ({
          name: "Dunroamin",
          door: f.make("door"),
        }),
      })

    f.set("color", "red")
    const foo = f.make("house")
    expect(foo.door.color).toEqual("red")
  })

  test("partial copy", () => {
    let f = FixtureMemo.from({ color: () => "red" })
      .withFactories({
        door: (f) => ({ color: f.props.color }),
      })
      .withFactories({
        house: (f) => ({
          name: "Dunroamin",
          door: f.make("door"),
        })
      })

    f.set("color", "red")
    const house1 = f.props.house
    const house2 = f.partialCopy(["door"]).props.house

    expect(house1).not.toBe(house2)
    expect(house1.door.color).toEqual("red")
    expect(house2.door.color).toEqual("red")
  })
})
