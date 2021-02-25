const chevrotain = require("chevrotain")
const Lexer = chevrotain.Lexer
const createToken = chevrotain.createToken

const tokenVocabulary = {}

//regexp-to-ast.js does not support \p{Ll} or \p{Lu} see chevrotain issues 777
const Word = createToken({ name: "Word", pattern: /((\.[+?*])|[.([_@0-9a-zäöüß])((\.[+?*]?)|[()[\]\|_@0-9a-zäöüß])*(\.[+?*]?)?/})
const Pos = createToken({ name: "Pos", pattern: /f?(\.[+?*])?[.([A-Z]((\.[+?*]?)|[()[\]\|A-Z])*f?((\.[+?*]?)|[()[\]\|A-Z])*(\.[+?*]?)?/})
const Tag = createToken({ name: "Tag", pattern: /<[^>]+>/})
const Space = createToken({ name: "Space", pattern: / +/, longer_alt: Tag})
const LParen = createToken({ name: "LParen", pattern: /\(/, longer_alt: Word})
const RParen = createToken({ name: "LParen", pattern: /\)/, longer_alt: Word})
const Quants = createToken({ name: "Quants", pattern: /[+?*]/, longer_alt: Word})
const And = createToken({ name: "And", pattern: /,/, longer_alt: Word})
const Or = createToken({ name: "Or", pattern: /\|/, longer_alt: Word})
const Attribute = createToken({ name: "Attribute", pattern: /([lpf]|(pf)):/, longer_alt: Word})
const Within = createToken({ name: "Within", pattern: /within/})
const Containing = createToken({ name: "Containing", pattern: /containing/})

const allTokens = [
    Space,
    // keywords
    Within,
    Containing,
    LParen,
    RParen,
    Quants,
    Or,
    And,
    Tag,
    // words
    Attribute,
    Word,
    Pos
]

const VoiceLexer = new Lexer(allTokens)

allTokens.forEach((tokenType) => {
    tokenVocabulary[tokenType.name] = tokenType
  })

class VoiceLexingError extends Error {
    constructor(errors) {
        super()
        this.errors = errors
    }
}

module.exports = {
    tokenVocabulary: tokenVocabulary,

    VoiceLexingError: VoiceLexingError,
  
    lex: function (inputText) {
      const lexingResult = VoiceLexer.tokenize(inputText)

      if (lexingResult.errors.length > 0) {
         throw new VoiceLexingError(lexingResult.errors)
      }
  
      return lexingResult
    }
  }