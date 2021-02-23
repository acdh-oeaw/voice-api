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
           $.OR([
               { ALT: () => $.SUBRULE($.word) },               
               { ALT: () => $.SUBRULE($.attributeValue) }
           ])
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
        $.RULE("attribute", () => {
            $.CONSUME(v.Attribute)
        })
        $.RULE("pos", () => {
            $.CONSUME(v.Pos)
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