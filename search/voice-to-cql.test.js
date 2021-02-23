const { toCQL } = require("./voice-to-cql")

test('simple phrase "just a test"', () => {
    expect(toCQL("just a test")).toBe('[word="just"] [word="_.*"]* [word="a"] [word="_.*"]* [word="test"] [word="_.*"]* ')
})

test('lemma test "l:be l:not"', () => {
    expect(toCQL("l:be l:not")).toBe('[l="be"] [word="_.*"]* [l="not"] [word="_.*"]* ')
})

test('wildcard * test house, houses, household, housewife ... "a house.*"', () => {
    expect(toCQL("a house.*")).toBe('[word="a"] [word="_.*"]* [word="house.*"] [word="_.*"]* ')
})

test('wildcard + test houses, household, housewife ... "a house.+"', () => {
    expect(toCQL("a house.+")).toBe('[word="a"] [word="_.*"]* [word="house.+"] [word="_.*"]* ')
})

test('wildcard ? test house, houses "a house.+"', () => {
    expect(toCQL("a house.?")).toBe('[word="a"] [word="_.*"]* [word="house.?"] [word="_.*"]* ')
})

test('pos test "only p:NN"', () => {
    expect(toCQL("only p:NN")).toBe('[word="only"] [word="_.*"]* [p="NN"] [word="_.*"]* ')
})

test('"within the p:NN"', () => {
    expect(toCQL("within the p:NN")).toBe('[word="within"] [word="_.*"]* [word="the"] [word="_.*"]* [p="NN"] [word="_.*"]* ')
})

test('"containing"', () => {
    expect(toCQL("containing")).toBe('[word="containing"] [word="_.*"]* ')
})