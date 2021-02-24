const chevrotain = require("chevrotain")
const Lexer = chevrotain.Lexer
const createToken = chevrotain.createToken

const tokenVocabulary = {}

//regexp-to-ast.js does not support \p{Ll} or \p{Lu} see chevrotain issues 777
const Word = createToken({ name: "Word", pattern: /(\.[+?*]?)?[._0-9a-zäöüß]((\.[+?*]?)|[_0-9a-zäöüß])*(\.[+?*]?)?/})
const Pos = createToken({ name: "Pos", pattern: /f?(\.[+?*]?)?[.A-Z]((\.[+?*]?)|[A-Z])*f?((\.[+?*]?)|[A-Z])*(\.[+?*]?)?/})
const Space = createToken({ name: "Space", pattern: / +/})
const LParen = createToken({ name: "LParen", pattern: /\(/})
const RParen = createToken({ name: "LParen", pattern: /\)/})
const Quants = createToken({ name: "Quants", pattern: /[+?*]/})
const And = createToken({ name: "And", pattern: /,/})
const Attribute = createToken({ name: "Attribute", pattern: /([lpf]|(pf)):/, longer_alt: Word})
const Tag = createToken({ name: "Tag", pattern: /<[^>]+>/})
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

module.exports = {
    tokenVocabulary: tokenVocabulary,
  
    lex: function (inputText) {
      const lexingResult = VoiceLexer.tokenize(inputText)
  
      return lexingResult
    }
  }