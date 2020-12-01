const path = require('path')
const fs = require('fs')

module.exports = class ResponsiveImage {
  apply(parser) {
    const { loaderContext } = parser
    parser.hooks.traverse.for('img').tap('ResponsiveImage', (node) => {
      const { attrs } = node
      if (/^\./.test(attrs.src)) {
        const src = path.resolve(loaderContext.context, attrs.src)
        const name = path.parse(src).name
        let dir
        let srcset = [[], []]
        let sizes = []
        try {
          const data = fs.statSync(src)
          if (data.isDirectory()) {
            dir = src
          } else {
            dir = path.dirname(src)
          }
          const files = fs.readdirSync(dir)
          for (const file of files) {
            const regExp = new RegExp('^' + name + '(.*)\\..+$')
            const match = file.match(regExp)
            if (!match) {
              continue
            }
            if (!match[1]) {
              const src = path.resolve(dir, file)
              loaderContext.resolve(dir, src, (err, result) => {
                console.log(err, result)
              })
              srcset[0].push(src)
              srcset[1].push(src)
              continue
            }
            if (match[1].charAt(0) !== '@') {
              continue
            }
            let unparse = match[1].slice(1)
            const marks = parseMark(unparse)
            const src = [path.resolve(dir, file)]
            if (!marks[1]) {
              if (marks[0]) {
                src.push(marks[0])
                srcset[0].push(src.join(' '))
              }
            } else {
              sizes.push(size(marks[4], marks[1], marks[2]))
              srcset[1].push(src.join(' '))
            }
          }
          attrs.srcset = srcset[1] ? srcset[1].join(', ') : srcset[0].join(', ')
          attrs.size = sizes.join(', ')
          
        } catch (error) {
          console.error('responsive image plugin: src error')
        }
      }
      return node
    })
  }

  resolve(context, path, callback) {
    
  }
}

function parseMark(mark) {
  const match = (/^(\d+?x)|(\d+?px)(\d+?(px|em|vw))(min|max)$/.exec(mark) || []).slice()
  if (!match.length === 0) {
    return
  }
  return match.slice(1)
}

function mediaCondition(feature, vp) {
  return `(${feature}-width: ${vp})`
}

function size(feature, vp, width) {
  return mediaCondition(feature, vp) + ' ' + width
}