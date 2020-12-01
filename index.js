const { getOptions } = require('loader-utils')
const Parser = require('./parser')

module.exports = function(source) {
  const options = getOptions(this);
  const { plugins } = options
  const parser = new Parser(this)
  if (Array.isArray(plugins)) {
    for (const plugin of plugins) {
      if (typeof plugin === 'function') {
        plugin.call(parser, parser)
      } else {
        plugin.apply(parser)
      }
    }
  }
  const tree = parser.parse(source)
  parser.traverse(tree, (err, result) => {
    let callback = this.async()
    if (err) {
      return callback(err)
    }
    return callback(null, source)
  })
}