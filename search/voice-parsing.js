const { lex, tokenVocabulary } = require("./voice-lexing.js")
const { CstParser } = require("chevrotain")

class VoiceParser extends CstParser {
    constructor() {
        super(tokenVocabulary)

        const $ = this,
              v = tokenVocabulary

        $.RULE("query", () => {
          $.MANY_SEP({
              SEP: v.Space,
              DEF: () => {
                  $.SUBRULE($.token)
              }
          })
        })

        $.RULE("token", () => {
            $.OPTION1(() => {
                $.OR([
                    { ALT: () => $.SUBRULE($.wordAndAttributeValue) },
                    { ALT: () => $.SUBRULE($.pos) },
                    { ALT: () => $.SUBRULE($.word) },               
                    { ALT: () => $.SUBRULE($.attributeValue) }
                ])
            })
            $.OPTION2(() => { $.SUBRULE($.quants) })
        })
        
        $.RULE("word", () => {
           $.OR([
                { ALT: () => $.CONSUME(v.Word) },
                { ALT: () => $.CONSUME(v.Within) },
                { ALT: () => $.CONSUME(v.Containing) }
           ])
        })
        $.RULE("attributeValue", () => {
            $.SUBRULE($.attribute)
            $.OR([
                { ALT: () => $.SUBRULE($.word) },
                { ALT: () => $.SUBRULE($.pos) }
            ])
        })
        $.RULE("wordAndAttributeValue", () => {
            $.OR1([
                { ALT: () => $.SUBRULE1($.pos) },
                { ALT: () => $.SUBRULE1($.word) },
                { ALT: () => $.SUBRULE1($.attributeValue) }
            ])
            $.CONSUME(v.And)
            $.OR2([
                { ALT: () => $.SUBRULE2($.pos) },
                { ALT: () => $.SUBRULE2($.word) },
                { ALT: () => $.SUBRULE2($.attributeValue) }
            ])
        })
        $.RULE("attribute", () => {
            $.CONSUME(v.Attribute)
        })
        $.RULE("pos", () => {
            $.CONSUME(v.Pos)
        })
        $.RULE("quants", () => {
            $.CONSUME(v.Quants)
        })
        this.performSelfAnalysis()
    }
}

const parserInstance = new VoiceParser()

module.exports = {
    parserInstance: parserInstance,
  
    VoiceParser: VoiceParser,
  
    parse: function (inputText) {
      const lexResult = lex(inputText)
  
      // ".input" is a setter which will reset the parser's internal's state.
      parserInstance.input = lexResult.tokens
  
      // No semantic actions so this won't return anything yet.
      parserInstance.query()
  
    //   if (parserInstance.errors.length > 0) {
    //     throw Error(
    //       "Sad sad panda, parsing errors detected!\n" +
    //         parserInstance.errors[0].message
    //     )
    //   }
      return parserInstance
    }
  }