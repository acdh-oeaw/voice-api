const { lex, tokenVocabulary, VoiceLexingError } = require("./voice-lexing.js")
const { CstParser } = require("chevrotain")

class VoiceParser extends CstParser {
    constructor() {
        super(tokenVocabulary)

        const $ = this,
              v = tokenVocabulary

        $.RULE("query", () => {
          $.OPTION1(() => {
              $.SUBRULE($.tagContaining)
          })
          $.MANY_SEP({
              SEP: v.Space,
              DEF: () => {
                  $.SUBRULE($.token)
              }
          })
        })

        $.RULE('tagContaining', () =>{
            $.SUBRULE($.tag)
            $.CONSUME1(v.Space)
            $.CONSUME(v.Containing)
            $.CONSUME2(v.Space)
        })

        $.RULE("token", () => {
            $.OPTION1(() => {
                $.OR([
                    { ALT: () => $.SUBRULE($.tag) },
                    { GATE: () => $.LA(1).tokenType === v.Within && $.LA(3).tokenType === v.Tag, ALT: () => $.SUBRULE($.withinTag) },
                    { GATE: isContainingTag, ALT: () => $.SUBRULE($.containingTag) },
                    { ALT: () => $.SUBRULE($.wordAndAttributeValue) },
                    { ALT: () => $.SUBRULE($.pos) },
                    { ALT: () => $.SUBRULE($.word) },               
                    { ALT: () => $.SUBRULE($.attributeValue) },
                    { ALT: () => $.SUBRULE2($.and) },
                    { ALT: () => $.SUBRULE2($.or_) },
                    { ALT: () => $.SUBRULE2($.lparen) },
                    { ALT: () => $.SUBRULE2($.rparen) }
                ])
            })
            $.OPTION2(() => { $.SUBRULE($.quants) })
        })

        function isContainingTag() {
            return (($.LA(1).tokenType === v.Word || $.LA(1).tokenType === v.Pos) && $.LA(3).tokenType === v.Containing && $.LA(5).tokenType === v.Tag)||
                   ($.LA(1).tokenType === v.Attribute && ($.LA(2).tokenType === v.Word || $.LA(2).tokenType === v.Pos) && $.LA(4).tokenType === v.Containing && $.LA(6).tokenType === v.Tag)
        }

        $.RULE("withinTag", () => {           
           $.CONSUME(v.Within)
           $.CONSUME2(v.Space)
           $.SUBRULE($.tag)
        })

        $.RULE("containingTag", () => {
            $.OR([
                { ALT: () => $.SUBRULE($.attributeValue) },
                { ALT: () => $.SUBRULE($.pos) },
                { ALT: () => $.SUBRULE($.word) }
            ])
            $.CONSUME1(v.Space)
            $.CONSUME2(v.Containing)
            $.CONSUME3(v.Space)
            $.SUBRULE($.tag)
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
            $.OR2([
                { ALT: () => $.SUBRULE2($.and) },
                { ALT: () => $.SUBRULE2($.or_) }
            ])
            $.OR3([
                { ALT: () => $.SUBRULE3($.pos) },
                { ALT: () => $.SUBRULE3($.word) },
                { ALT: () => $.SUBRULE3($.attributeValue) }
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
        $.RULE("tag", () =>{
            $.CONSUME(v.Tag)
        })
        $.RULE("and", () =>{
            $.CONSUME(v.And)
        })
        $.RULE("or_", () =>{
            $.CONSUME(v.Or)
        })
        $.RULE("lparen", () =>{
            $.CONSUME(v.LParen)
        })
        $.RULE("rparen", () =>{
            $.CONSUME(v.RParen)
            $.OPTION(() => { $.SUBRULE($.quants) })
        })
        this.performSelfAnalysis()
    }
}

const parserInstance = new VoiceParser()

class VoiceParsingError extends Error {
    constructor(errors) {
        super()
        this.errors = errors
    }
}

module.exports = {
    parserInstance: parserInstance,
  
    VoiceParser: VoiceParser,
    VoiceLexingError: VoiceLexingError,
    VoiceParsingError: VoiceParsingError,
  
    parse: function (inputText) {
      const lexResult = lex(inputText)
  
      // ".input" is a setter which will reset the parser's internal's state.
      parserInstance.input = lexResult.tokens
  
      // No semantic actions so this won't return anything yet.
      const cst = parserInstance.query()
  
      if (parserInstance.errors.length > 0) {
        throw new VoiceParsingError(parserInstance.errors)
      }
      return cst
    }
  }