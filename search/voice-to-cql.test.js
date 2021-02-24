const { toCQL } = require("./voice-to-cql")

test('simple phrase "just a test"', () => {
    expect(toCQL("just a test")).toBe('[word="just"] [word="_.*"]* [word="a"] [word="_.*"]* [word="test"]')
})

test('lemma test "l:be l:not"', () => {
    expect(toCQL("l:be l:not")).toBe('[l="be"] [word="_.*"]* [l="not"]')
})

test('wildcard * test house, houses, household, housewife ... "a house.*"', () => {
    expect(toCQL("a house.*")).toBe('[word="a"] [word="_.*"]* [word="house.*"]')
})

test('wildcard + test houses, household, housewife ... "a house.+"', () => {
    expect(toCQL("a house.+")).toBe('[word="a"] [word="_.*"]* [word="house.+"]')
})

test('wildcard ? test house, houses "a house.+"', () => {
    expect(toCQL("a house.?")).toBe('[word="a"] [word="_.*"]* [word="house.?"]')
})

test('pos test "only p:NN"', () => {
    expect(toCQL("only p:NN")).toBe('[word="only"] [word="_.*"]* [p="NN"]')
})

test('pos test "only NN"', () => {
    expect(toCQL("only NN")).toBe('[word="only"] [word="_.*"]* [p="NN"]')
})

test('"within the p:NN"', () => {
    expect(toCQL("within the p:NN")).toBe('[word="within"] [word="_.*"]* [word="the"] [word="_.*"]* [p="NN"]')
})

test('"containing"', () => {
    expect(toCQL("containing")).toBe('[word="containing"]')
})

test('combine word and attribute "get,p:VVP"', () => {
    expect(toCQL("get,p:VVP")).toBe('[word="get" & p="VVP"]')
})

test('combine word and attribute "VVP,get"', () => {
    expect(toCQL("VVP,get")).toBe('[word="get" & p="VVP"]')
})

test('combine word and attribute "l:get,p:VVP"', () => {
    expect(toCQL("l:get,p:VVP")).toBe('[l="get" & p="VVP"]')
})

test('combine word and attribute "austrian,N.*"', () => {
    expect(toCQL("austrian,N.*")).toBe('[word="austrian" & p="N.*"]')
})

test('combine word and attribute "austrian,p:N.*"', () => {
    expect(toCQL("austrian,p:N.*")).toBe('[word="austrian" & p="N.*"]')
})

test('combine word and attribute "VV,go"', () => {
    expect(toCQL("VV,go")).toBe('[word="go" & p="VV"]')
})

test('combine word and attribute "VV,l:go"', () => {
    expect(toCQL("VV,l:go")).toBe('[l="go" & p="VV"]')
})

test('pause 1 "_1"', () => {
    expect(toCQL("_1")).toBe('[word="_1"]')
})

test('token quants "a JJ? thing"', () => {
    expect(toCQL("a JJ? thing")).toBe('[word="a"] [word="_.*"]* [p="JJ"]? [word="_.*"]* [word="thing"]')
})

test('token quants "a JJ.+? thing"', () => {
    expect(toCQL("a JJ.+? thing")).toBe('[word="a"] [word="_.*"]* [p="JJ.+"]? [word="_.*"]* [word="thing"]')
})

test('token quants "a * thing"', () => {
    expect(toCQL("a * thing")).toBe('[word="a"] [word="_.*"]* [word!="u___"]* [word="_.*"]* [word="thing"]')
})

test('lemma and pos "l:under.*,NNS', () => {
    expect(toCQL("l:under.*,NNS")).toBe('[l="under.*" & p="NNS"]')
})