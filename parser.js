const { AsyncSeriesWaterfallHook, HookMap } = require('tapable')
const { Parser } = require('htmlparser2')

module.exports = class HTMLParser {
  constructor(context) {
    this.loaderContext = context
    this.hooks = {
      traverse: new HookMap(() => new AsyncSeriesWaterfallHook(['node'])),
      traversed: new AsyncSeriesWaterfallHook(['tree'])
    }
  }

  traverse(tree, callback) {
    if (!tree) {
      callback(null, tree)
      return
    }
    async(tree, (node, cb) => {
      this.hooks.traverse.for(typeof node === 'string' ? 'text' : node.tag).callAsync(node, (err, result) => {
        if (err) {
          return cb(err)
        }
        if (!result.children) {
          cb(null, result)
          return
        }
        this.traverse(result.children, (err, children) => {
          if (err) {
            return cb(err)
          }
          result.children = children
          return cb(null, result)
        })
      });
    }, () => {
      this.hooks.traversed.callAsync(tree, (err, result) => {
        if (err) {
          return callback(err)
        }
        return callback(null, result)
      })
    })

  }

  parse(html) {
    const tree = []
    const buffers = []
    const insert = (buffer) => {
      const last = buffers[buffers.length - 1]
      if (!last) {
        tree.push(buffer)
        return
      }
      last.children ? last.children.push(buffer) : last.children = [buffer]
    }
    const parser = new Parser({
      onopentag: (tag, attrs) => {
        buffers.push({
          tag,
          attrs
        })
      },
      onclosetag: () => {
        const buffer = buffers.pop()
        insert(buffer)
      },
      ontext: (data) => {
        insert(data)
      },
      oncomment: (data) => {

      }
    })
    parser.write(html)
    parser.end()

    return tree
  }
}

function async(deps, callback, done) {
  let count = deps.length
  let values = []

  for (let i = 0; i < deps.length; i++) {
    callback(deps[i], (err, result) => {
      if (err) {
        return done(err)
      }
      values[i] = result
      count--
      if (count === 0) {
        return done(null, values)
      }
    })
  }
}