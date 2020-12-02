module.exports = class HTMLRender {

  render(tree) {
    if (!tree) {
      return
    }
    return this.forEach(tree, (node) => {
      return this.transform(node)
    }).join('')
  }
  transform(node) {
    let children = []
    if (node && node.children) {
      children = this.forEach(node.children, (item) => {
        return this.transform(item)
      }).join('')
    }
    if (typeof node === 'string') {
      return node
    }
    let { tag, attrs } = node
    return this.tag(tag, attrs, children) 
  }

  tag(tag, attrs, children) {
    let single = false
    if (!children || children.length === 0) {
      single = true
    }
    const endTag = single ? '/>' : `>${children}</${tag}>`
    return `<${tag} ${this.attrs(attrs)}${endTag}`
  }

  attrs(obj) {
    if (!obj) {
      return ''
    }
    let attrs = ''
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const element = obj[key];
        attrs += ` ${key}="${element}"`
      }
    }
    return (attrs.charAt(0) === ' ' && (attrs = attrs.slice(1)), attrs)
  }

  forEach(array, callback) {
    if (!Array.isArray(array)) {
      array = [array]
    }
    let values = []
    for (const item of array) {
      values.push(callback(item))
    }
    return values
  }
}