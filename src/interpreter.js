// @ts-check

/**
 * @typedef {import('./AST').AST} AST
 * @typedef {import('./AST').ASTLambda} ASTLambda
 * @typedef {import('./AST').ASTApplication} ASTApplication
 */

/**
 * @param {AST} ast
 * @param {Environment} env
 * @returns {any}
 */
const evaluate = (ast, env) => {
  switch (ast.type) {
    case "number":
      return ast.value;
    case "program":
      let val = false;
      ast.body.forEach((exp) => {
        val = evaluate(exp, env);
      });
      return val;
    case "variable":
      return env.get(ast.value);
    case "assign":
      return env.set(ast.identifier.value, evaluate(ast.expression, env));
    case "lambda":
      return make_function(ast, env);
    case "application":
      return make_application(ast, env);
    default:
      throw new Error("I don't know how to evaluate " + ast.type);
  }
};

/**
 * @param {ASTApplication} ast
 * @param {Environment} env
 * @returns {any}
 */
const make_application = (ast, env) => {
  const func = evaluate(ast.identifier, env);
  const arguments = ast.arguments.map((arg) => evaluate(arg, env));
  return func.apply(null, arguments);
};

/**
 * @param {ASTLambda} ast
 * @param {Environment} env
 * @returns {any}
 */
const make_function = (ast, env) => {
  function fn() {
    const names = ast.variable;
    const scope = env.extend();
    for (let i = 0; i < names.length; ++i)
      scope.def(names[i], i < arguments.length ? arguments[i] : false);
    return evaluate(ast.body, scope);
  }
  return fn;
};

if (typeof process != "undefined") {
  const fs = require("node:fs");
  const yargs = require("yargs/yargs");
  const { hideBin } = require("yargs/helpers");
  const { fullLog } = require("./helper/logger");

  const file_path = yargs(hideBin(process.argv)).argv["_"][0];

  if (!file_path) {
    throw new Error("No file specified");
  }

  const code = fs.readFileSync(file_path, "utf8");

  const InputStream = require("./InputStream");
  const TokenStream = require("./TokenStream");
  const Parser = require("./Parser");
  const Environment = require("./Environment");

  const globalEnv = new Environment();

  globalEnv.def("print", fullLog);
  globalEnv.def("add", (a, b) => a + b);

  const input_stream = InputStream(code);
  const token_stream = TokenStream(input_stream);
  const ast = Parser(token_stream);

  evaluate(ast, globalEnv);
}
