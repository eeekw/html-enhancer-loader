const { getOptions } = require('loader-utils')
const Parser = require('./parser')

module.exports = (source) => {
  const options = getOptions(this);
  const { plugins } = options
  const parser = new Parser(this)
  if (plugins && plugins.length > 0) {
    for (const plugin of plugins) {
      plugin.apply(parser)
    }
  }
  const tree = parser.parse(source)
  parse.traverse(tree)

  let callback = this.async()
  callback(null, source)
}