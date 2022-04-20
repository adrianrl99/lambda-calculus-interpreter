const util = require("util");

module.exports = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  fullLog: (...args) =>
    console.log(
      util.inspect(...args, { showHidden: false, depth: null, colors: true })
    ),
};
