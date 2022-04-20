// @ts-check

/**
 * @typedef {ASTAssign|ASTOperator|ASTApplication|ASTNumber|ASTPunctuation|ASTIdentifier|ASTProgram|ASTLambda} AST
 *
 * @typedef {object} ASTLambda
 * @property {'lambda'} type
 * @property {string[]} variable
 * @property {AST} body
 *
 * @typedef {object} ASTProgram
 * @property {'program'} type
 * @property {AST[]} body
 *
 * @typedef {object} ASTIdentifier
 * @property {'variable'|'keyword'} type
 * @property {string} value
 *
 * @typedef {object} ASTPunctuation
 * @property {'punctuation'} type
 * @property {string} value
 *
 * @typedef {object} ASTNumber
 * @property {'number'} type
 * @property {number} value
 *
 * @typedef {object} ASTApplication
 * @property {'application'} type
 * @property {AST} identifier
 * @property {AST[]} arguments
 *
 * @typedef {object} ASTOperator
 * @property {'operator'} type
 * @property {string} value
 *
 * @typedef {object} ASTAssign
 * @property {'assign'} type
 * @property {ASTIdentifier} identifier
 * @property {AST} expression
 */

module.exports = {}
