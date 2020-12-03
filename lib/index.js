const { getOptions } = require('loader-utils')
const Parser = require('./parser')
const Render = require('./render')

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
  let callback = this.async()
  const tree = parser.parse(source)
  parser.traverse(tree, (err, result) => {
    if (err) {
      return callback(err)
    }
    const html = new Render().render(result)
    return callback(null, html) 
  })
}