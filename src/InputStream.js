// @ts-check

/**
 * @typedef {object} InputStreamResult
 * @property {InputStreamNext} next
 * @property {InputStreamPeek} peek
 * @property {InputStreamEof} eof
 * @property {InputStreamCroak} croak
 *
 * @typedef {function(): ?string} InputStreamNext
 * @typedef {function(): ?string} InputStreamPeek
 * @typedef {function(): boolean} InputStreamEof
 * @typedef {function(string): void} InputStreamCroak
 */

/**
 * @param {string} code
 * @returns {InputStreamResult}
 */
module.exports = code => {
  let pos = 0,
    line = 1,
    col = 0

  /** @type {InputStreamNext} */
  const next = () => {
    const ch = code.charAt(pos++)
    if (ch === '\n') {
      line++
      col = 0
    } else col++
    return ch
  }

  /** @type {InputStreamPeek} */
  const peek = () => code.charAt(pos)

  /** @type {InputStreamEof} */
  const eof = () => peek() === ''

  /** @type {InputStreamCroak} */
  const croak = msg => {
    throw new Error(`${msg} ${line}:${col}`)
  }

  return { next, peek, eof, croak }
}
