const path = require('path')

module.exports = class ResponsiveImage {
  apply(parser) {
    const { loaderContext } = parser
    const { fs } = loaderContext
    const { getDir, readDir } = createFs(fs)
    const relative = createRelative(loaderContext)
    parser.hooks.traverse.for('img').tapPromise('ResponsiveImage', (node) => {

      return new Promise((resolve, reject) => {
        const { attrs } = node
        if (!/^\./.test(attrs.src)) {
          return resolve(node)
        }
        const source = path.resolve(loaderContext.context, attrs.src)
        const { name } = path.parse(source)
        const matchFile = this._createMatchFile(name)
        const parseMark = this._createParseMark()

        getDir(source).then(dir => {
          return readDir(dir).then((files) => Promise.resolve([files, dir]))
        }).then(([files, dir]) => {
          let marks = []
          const marksMap = new Map()
          const srcset = []
          const sizes = []
          for (const file of files) {
            const match = matchFile(file)
            if (!match) {
              continue
            }
            if (!match[1]) {
              marksMap.set('default', relative(dir, file))
              continue
            }
            let unparse = match[1].slice(1)
            const mark = parseMark(unparse)
            if (!mark) {
              continue
            }
            marks[mark[1]] = mark
            marksMap.set(mark, relative(dir, file))
          }
          marks = marks.filter(v => !!v)
          if (!marks.length) {
            return resolve(node)
          }
          const isMQ = marks.findIndex(v => v[0] === 1) > -1
          const last = marks[marks.length - 1]
          for (const mark of marks.slice(0, -1)) {
            const [, o, px, w, vp, f] = mark
            if (isMQ && mark[0] === 1) {
              sizes.push(size(f, vp, w))
            }
            srcset.push(`${marksMap.get(mark)} ${px}`)
          }
          srcset.push(`${marksMap.get(last)} ${last[2]}`)
          sizes.push(last[3])
          if (marksMap.has('default')) {
            srcset.push(marksMap.get('default'))
          }

          attrs.srcset = srcset.join(', ')
          attrs.sizes = sizes.join(', ')
          resolve(node)
        }).catch(err => {
          resolve(node)
        })
      })
    })
  }

  _createMatchFile(name) {
    const regExp = new RegExp('^' + name + '(@.*)?\\.(png|svg|jpg|jpeg|gif)$')
    return (file) => {
      return file.match(regExp)
    }
  }

  _createParseMark() {
    const regExp = /^(\d)_((\d+?x)|(\d+?w)(\d+?(px|em|vw))(\d+?px)(min|max))$/
    return (mark) => {
      const match = (regExp.exec(mark) || []).slice()
      if (match.length === 0) {
        return
      }
      let [o, , x, px, w, , vp, f] = match.slice(1)
      if (px) {
        return [
          1, o, px, w, vp, f
        ]
      }
      return [0, o, x]
    }
  }
}

function createRelative(loaderContext) {
  return (dir, file) => {
    let rPath = path.relative(loaderContext.context, path.resolve(dir, file))
    if (!/^\.\.?[/\\]/.test(rPath)) {
      rPath = './' + rPath
    }
    return rPath.replace(/\\/g, '/')
  }
}

function createFs(fs) {
  const getDir = (resourcePath) => {
    return new Promise((resolve, reject) => {
      fs.stat(resourcePath, (err, stats) => {
        if (err) {
          return reject(err)
        }
        if (stats.isFile()) {
          return resolve(path.dirname(resourcePath))
        }
        if (stats.isDirectory()) {
          return resolve(resourcePath)
        }
      })
    })
  }

  const readDir = (dir) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          return reject(err)
        }
        return resolve(files)
      })
    })
  }
  return {
    getDir, readDir
  }
}

function mediaCondition(feature, vp) {
  return `(${feature}-width: ${vp})`
}

function size(feature, vp, width) {
  return mediaCondition(feature, vp) + ' ' + width
}