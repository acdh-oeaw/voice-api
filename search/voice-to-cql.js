const { lex } = require("./voice-lexing.js")
const { parserInstance } = require("./voice-parsing.js")

const BaseVoiceVisitor = parserInstance.getBaseCstVisitorConstructor()

class VoiceToCQL extends BaseVoiceVisitor {
    constructor() {
        super()
        this.validateVisitor()
      }

    query(ctx) {
        var cql = ""
        const $ = this
        ctx.token.forEach(token => cql += $.visit(token))
        return cql
    }
    
    token(ctx) {
        if (ctx.word) { return this.visit(ctx.word) }
        if (ctx.attributeValue) { return this.visit(ctx.attributeValue) }
    }
    
    word(ctx) {
        const word = ctx.Word ? ctx.Word[0].image :
                     ctx.Within ? ctx.Within[0].image :
                     ctx.Containing ? ctx.Containing[0].image : undefined
        return `[word="${word}"] [word="_.*"]* `
    }

    attributeValue(ctx) {
        const attribute = this.visit(ctx.attribute).replace(":", "=")
        const value = ctx.word ? ctx.word[0].children.Word[0].image :
                      ctx.pos ? ctx.pos[0].children.Pos[0].image : ''
        return `[${attribute}"${value}"] [word="_.*"]* `
    }

    attribute(ctx) {
        return ctx.Attribute[0].image
    }

    pos(ctx) {}
}

const voiceToCQL = new VoiceToCQL()

module.exports = {
    toCQL: function (inputText) {
        const lexResult = lex(inputText)

        // ".input" is a setter which will reset the parser's internal's state.
        parserInstance.input = lexResult.tokens
    
        // Automatic CST created when parsing
        const cst = parserInstance.query()
        
        if (parserInstance.errors.length > 0) {
            return cst.errors
        }

        const CQL = voiceToCQL.visit(cst)

        return CQL
    }
}