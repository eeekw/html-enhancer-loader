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
      return
    }
    async(tree, (node) => {
      if (typeof node === 'string') {
        this.hooks.traverse.for('text').callAsync(node, (err, result) => {
          tree[i] = result
        });
        continue
      }
      tree[i] = this.hooks.traverse.for(node.tag).callAsync(node, (err, result) => {
        tree[i] = result
      });
      this.traverse(node.children, callback)
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
  const cb = () => {
    count--
    if (count === 0) {
      done()
    }
  }
  for (let i = 0; i < deps.length; i++) {
    callback(deps[i], cb)
  }
}