const { SyncWaterfallHook, HookMap } = require('tapable')
const { Parser } = require('htmlparser2')

module.exports = class HTMLParser {
  constructor(context) {
    this.context = context
    this.hooks = {
      traverse: new HookMap(() => new SyncWaterfallHook(['context', 'node'])),
      traversed: new SyncWaterfallHook(['context', 'tree'])
    }
  }

  traverse(tree) {
    if (!tree) {
      return
    }
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      tree[i] = this.hooks.traverse.for(node.tag).call([this.context, node]);
      this.traverse(node.children)
    }
    this.hooks.traversed.call([this.context, tree])
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
    parser = new Parser({
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