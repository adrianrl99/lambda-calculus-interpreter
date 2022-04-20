// @ts-check

/**
 * @constructor
 * @param {Environment} [parent]
 */
function Environment(parent) {
  /**
   * @name Environment#vars
   * @type {Record<string, any>}
   */
  this.vars = Object.create(parent ? parent.vars : null)
  /**
   * @name Environment#parent
   * @type {Environment}
   */
  this.parent = parent
}

Environment.prototype = {
  /**
   * @return {Environment}
   */
  extend() {
    return new Environment(this)
  },
  /**
   *
   * @param {string} name
   */
  lookup(name) {
    /** @type {Environment} */
    let scope = this
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope
      scope = scope.parent
    }
  },
  /**
   * @param {string} name
   * @returns {any}
   */
  get(name) {
    if (name in this.vars) return this.vars[name]
    throw new Error(`Undefined variable ${name}`)
  },
  /**
   * @param {string} name
   * @param {string} value
   * @return {any}
   */
  set(name, value) {
    let scope = this.lookup(name)
    if (!scope && this.parent) throw new Error(`Undefined variable ${name}`)
    return ((scope || this).vars[name] = value)
  },
  /**
   * @param {string} name
   * @param {any} value
   * @returns {any}
   */
  def(name, value) {
    return (this.vars[name] = value)
  },
}

module.exports = Environment
