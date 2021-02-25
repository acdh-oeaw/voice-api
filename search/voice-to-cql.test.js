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

test('wildcard ? test house, houses "a house.?"', () => {
    expect(toCQL("a house.?")).toBe('[word="a"] [word="_.*"]* [word="house.?"]')
})

test('wildcard ? test house, houses ".?? house .??"', () => {
    expect(toCQL(".?? house .??")).toBe('([word=".?"][word="_.*"]*)? [word="_.*"]* [word="house"] [word="_.*"]* ([word=".?"][word="_.*"]*)?')
})

test('wildcard first ".+some"', () => {
    expect(toCQL(".+some")).toBe('[word=".+some"]')
})

test('wildcard middle "ha.+me"', () => {
    expect(toCQL("ha.+me")).toBe('[word="ha.+me"]')
})

test('wildcard middle single "n.t"', () => {
    expect(toCQL("n.t")).toBe('[word="n.t"]')
})

test('wildcard two letters ".."', () => {
    expect(toCQL("..")).toBe('[word=".."]')
})

test('wildcard two letters pos "p:.."', () => {
    expect(toCQL("p:..")).toBe('[p=".."]')
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

test('"(der|die|das) within <LNger/>"', () => {
    expect(toCQL("(der|die|das) within <LNger/>")).toBe('[word="(der|die|das)"] [word=\"_.*\"]* within <LNger/>')
})

test('"containing"', () => {
    expect(toCQL("containing")).toBe('[word="containing"]')
})

test('"<LNger/> containing (der|die|das)"', () => {
    expect(toCQL("<LNger/> containing (der|die|das)")).toBe('<LNger/> containing [word="(der|die|das)"]')
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
    expect(toCQL("a JJ? thing")).toBe('[word="a"] [word="_.*"]* ([p="JJ"][word="_.*"]*)? [word="_.*"]* [word="thing"]')
})

test('token quants "a JJ{1,2} thing"', () => {
    expect(toCQL("a JJ{1,2} thing")).toBe('[word="a"] [word="_.*"]* ([p="JJ"][word="_.*"]*){1,2} [word="_.*"]* [word="thing"]')
})

test('token quants "a JJ.+? thing"', () => {
    expect(toCQL("a JJ.+? thing")).toBe('[word="a"] [word="_.*"]* ([p="JJ.+"][word="_.*"]*)? [word="_.*"]* [word="thing"]')
})

test('token quants "a JJ.{0,3}{1,2} thing"', () => {
    expect(toCQL("a JJ.{0,3}{1,2} thing")).toBe('[word="a"] [word="_.*"]* ([p="JJ.{0,3}"][word="_.*"]*){1,2} [word="_.*"]* [word="thing"]')
})

test('token quants "a JJ.++ thing"', () => {
    expect(toCQL("a JJ.++ thing")).toBe('[word="a"] [word="_.*"]* ([p="JJ.+"][word="_.*"]*)+ [word="_.*"]* [word="thing"]')
})

test('token quants "a * thing"', () => {
    expect(toCQL("a * thing")).toBe('[word="a"] [word="_.*"]* [word!="u___"]* [word="_.*"]* [word="thing"]')
})

test('lemma and pos "l:under.*,NNS', () => {
    expect(toCQL("l:under.*,NNS")).toBe('[l="under.*" & p="NNS"]')
})

test('search laughter "_@@"', () => {
    expect(toCQL("_@@")).toBe('[word="_@@"]')
})

test('tags alone "<LNger> a.*"', () => {
    expect(toCQL("<LNger> a.*")).toBe('<LNger> [word="_.*"]* [word="a.*"]')
})

test('parentheses or within a word "(a|the)"', () => {
    expect(toCQL("(a|the)")).toBe('[word="(a|the)"]')
})

test('parentheses or as token alone "( a | the )" (throws error, not implemented yet)', () => {
    expect(() => { toCQL("( a | the )") }).toThrowError('Redundant input, expecting EOF but found: (')
})

test('wrong input "$$$"', () => {
    expect(() => { toCQL("$$$") }).toThrowError('unexpected character: ->$<- at offset: 0, skipped 3 characters.')
})

test('wrong input "[word="cql"]"', () => {
    expect(() => { toCQL("[word=\"cql\"]") }).toThrowError('unexpected character: ->=<- at offset: 5, skipped 2 characters.')
})

test('wrong input "<tag> [word="cql"]"', () => {
    expect(() => { toCQL("<tag> [word=\"cql\"]") }).toThrowError('unexpected character: ->=<- at offset: 11, skipped 2 characters.')
})

test('wrong input "<tag> "cql""', () => {
    expect(() => { toCQL("<tag> \"cql\"") }).toThrowError('unexpected character: ->"<- at offset: 6, skipped 1 characters.')
})