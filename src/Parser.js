// @ts-check

/**
 * @typedef {import('./TokenStream').TokenStreamResult} TokenStreamResult
 * @typedef {import('./AST').AST} AST
 * @typedef {import('./AST').ASTProgram} ASTProgram
 * @typedef {import('./AST').ASTIdentifier} ASTIdentifier
 * @typedef {import('./AST').ASTLambda} ASTFunction
 * @typedef {import('./AST').ASTPunctuation} ASTPunctuation
 * @typedef {import('./AST').ASTApplication} ASTApplication
 * @typedef {import('./AST').ASTOperator} ASTOperator
 */

/**
 * @param {TokenStreamResult} stream
 * @returns {ASTProgram}
 */
module.exports = (stream) => {
  /**
   * @param {string} x
   * @returns {ASTPunctuation | false}
   */
  const is_punctuation = (x) => {
    const ast = stream.peek();
    return ast && ast.type === "punctuation" && (!x || ast.value === x) && ast;
  };

  /**
   * @param {string} x
   * @returns {ASTIdentifier | false}
   */
  const is_keyword = (x) => {
    const ast = stream.peek();
    return ast && ast.type === "keyword" && (!x || ast.value === x) && ast;
  };

  /**
   * @param {string} [x]
   * @returns {ASTOperator | false}
   */
  const is_operator = (x) => {
    const ast = stream.peek();
    return ast && ast.type === "operator" && (!x || ast.value === x) && ast;
  };

  /**
   * @param {string} x
   */
  const skip_punctuation = (x) => {
    if (is_punctuation(x)) stream.next();
    else stream.croak(`Expecting punctuation: "${x}"`);
  };

  /**
   * @returns {string[]}
   */
  const parse_function_varnames = () => {
    const result = [];

    while (true) {
      let ast = stream.peek();
      if (ast.type === "punctuation" && ast.value === ".") break;
      ast = stream.next();
      if (ast.type === "variable") result.push(ast.value);
    }

    return result;
  };

  /**
   * @returns {AST[]}
   */
  const parse_function_arguments = () => {
    const result = [];

    while (true) {
      let ast = stream.peek();
      if (ast.type === "punctuation" && ast.value === ")") break;
      ast = parse_atom();
      result.push(ast);
    }

    return result;
  };

  /**
   * @returns {ASTFunction}
   */
  const parse_function = () => {
    const ast = stream.peek();
    const variable = parse_function_varnames();
    skip_punctuation(".");
    const body = parse_expression();

    return {
      type: "lambda",
      variable,
      body,
    };
  };

  /**
   * @returns {ASTApplication}
   */
  const parse_application = () => {
    const ast = stream.next();
    if (ast.type === "variable") {
      const identifier = ast;
      const arguments = parse_function_arguments();
      skip_punctuation(")");
      return {
        type: "application",
        identifier,
        arguments,
      };
    }
  };

  /**
   * @returns {AST}
   */
  const parse_atom = () => {
    if (is_keyword("λ")) {
      stream.next();
      return parse_function();
    }
    if (is_punctuation("(")) {
      stream.next();
      return parse_application();
    }
    const ast = stream.next();
    if (ast.type === "variable" || ast.type === "number") return ast;

    stream.croak(`Unexpected token: ${JSON.stringify(stream.peek())}`);
  };

  /**
   * @param {AST} identifier
   * @returns {AST}
   */
  const maybe_binary = (identifier) => {
    const ast = is_operator();
    if (ast && identifier.type === "variable") {
      stream.next();
      const expression = parse_atom();

      return {
        type: "assign",
        identifier,
        expression,
      };
    }
    return identifier;
  };

  /**
   * @returns {AST}
   */
  const parse_expression = () => maybe_binary(parse_atom());

  const body = [];

  while (!stream.eof()) {
    body.push(parse_expression());
    if (!stream.eof()) skip_punctuation(";");
  }

  return {
    type: "program",
    body,
  };
};
