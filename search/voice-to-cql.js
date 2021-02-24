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
        ctx.token.forEach((token, idx, tokens) => cql += `[${$.visit(token)}]` + (idx === tokens.length - 1 ? "" : ' [word="_.*"]* '))
        return cql
    }
    
    token(ctx) {
        if (ctx.wordAndAttributeValue) { return this.visit(ctx.wordAndAttributeValue) }
        if (ctx.pos) { return this.visit(ctx.pos) }
        if (ctx.word) { return this.visit(ctx.word) }
        if (ctx.attributeValue) { return this.visit(ctx.attributeValue) }
    }
    
    word(ctx) {
        const word = ctx.Word ? ctx.Word[0].image :
                     ctx.Within ? ctx.Within[0].image :
                     ctx.Containing ? ctx.Containing[0].image : undefined
        return `word="${word}"`
    }

    attributeValue(ctx) {
        const attribute = this.visit(ctx.attribute).replace(":", "=")
        const value = ctx.word ? ctx.word[0].children.Word[0].image :
                      ctx.pos ? ctx.pos[0].children.Pos[0].image : undefined
        return `${attribute}"${value}"`
    }

    wordAndAttributeValue(ctx) {
        const lhs = ctx.word ? {type: ctx.word.length === 2 ? 'word1' : 'word', v: this.visit(ctx.word)} :
                    ctx.attributeValue ? {type: ctx.attributeValue.length === 2 ? 'attributeValue1' : 'attributeValue', v: this.visit(ctx.attributeValue)} :
                    ctx.pos ? {type: ctx.pos.length === 2 ? 'pos1' : 'pos', v: this.visit(ctx.pos)} : undefined
        const rhs = ctx.attributeValue && lhs.type === 'attributeValue1' ? this.visit(ctx.attributeValue[1]) :
                    ctx.attributeValue && lhs.type !== 'attributeValue' ? this.visit(ctx.attributeValue) :
                    ctx.pos && lhs.type === 'pos1' ? this.visit(ctx.pos[1]) :
                    ctx.pos && lhs.type !== 'pos' ? this.visit(ctx.pos) :
                    ctx.word && lhs.type === 'word1' ? this.visit(ctx.word[1]) :
                    ctx.word && lhs.type !== 'word' ? this.visit(ctx.word) : undefined
        return `${lhs.v} & ${rhs}`
    }

    attribute(ctx) {
        return ctx.Attribute[0].image
    }

    pos(ctx) {
        const pos = ctx.Pos ? ctx.Pos[0].image : ""
        return `p="${pos}"`
    }
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