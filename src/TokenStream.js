// @ts-check

/**
 * @typedef {import('./InputStream').InputStreamResult} InputStreamResult
 * @typedef {import("./AST").AST} AST
 * @typedef {import("./AST").ASTIdentifier} ASTIdentifier
 */

/**
 * @typedef {object} TokenStreamResult
 * @property {TokenStreamNext} next
 * @property {TokenStreamPeek} peek
 * @property {TokenStreamEof} eof
 * @property {TokenStreamCroak} croak
 *
 * @typedef {function(): ?AST} TokenStreamNext
 * @typedef {function(): ?AST} TokenStreamPeek
 * @typedef {function(): boolean} TokenStreamEof
 * @typedef {function(string): void} TokenStreamCroak
 */

/**
 * @param {InputStreamResult} stream
 * @returns {TokenStreamResult}
 */
module.exports = (stream) => {
  /** @type {?AST} */
  let current = null;

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_function_identifier = (x) => /[λ]/.test(x);

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_function_variable = (x) => /[a-z]/.test(x);

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_punctuation = (x) => /[.;()]/.test(x);

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_whitespace = (x) => /[\s\t]/.test(x);

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_digit = (x) => /[0-9]/.test(x);

  /**
   * @param {string} x
   * @returns {boolean}
   */
  const is_operator_char = (x) => /[=]/.test(x);

  const skip_comment = () => {
    read_while((x) => x !== "\n");
    stream.next();
  };

  /**
   * @returns {AST}
   */
  const read_number = () => {
    let has_dot = false;
    let result = read_while((x) => {
      if (x === ".") {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return is_digit(x);
    });
    return {
      type: "number",
      value: parseFloat(result),
    };
  };

  /**
   * @param {function(string): boolean} predicate
   * @returns {string}
   */
  const read_while = (predicate) => {
    let result = "";
    while (!stream.eof() && predicate(stream.peek())) result += stream.next();
    return result;
  };

  /**
   * @returns {AST}
   */
  const read_next = () => {
    read_while(is_whitespace);
    if (stream.eof()) return null;
    const ch = stream.peek();
    if (ch === "#") {
      skip_comment();
      return read_next();
    }
    if (is_digit(ch)) return read_number();
    if (is_function_identifier(ch)) {
      return {
        type: "keyword",
        value: stream.next(),
      };
    }
    if (is_function_variable(ch)) {
      const variable = read_while(is_function_variable);
      return {
        type: "variable",
        value: variable,
      };
    }
    if (is_punctuation(ch)) {
      return {
        type: "punctuation",
        value: stream.next(),
      };
    }
    if (is_operator_char(ch)) {
      return {
        type: "operator",
        value: read_while(is_operator_char),
      };
    }

    stream.croak(`Can't handle character: ${ch}`);
  };

  /** @type {TokenStreamNext} */
  const next = () => {
    const ast = current;
    current = null;
    return ast || read_next();
  };

  /** @type {TokenStreamPeek} */
  const peek = () => current || (current = read_next());

  /** @type {TokenStreamEof} */
  const eof = () => peek() === null;

  return { next, peek, eof, croak: stream.croak };
};
