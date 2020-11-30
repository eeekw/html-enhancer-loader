class ResponsiveImage {
  apply(parser) {
    parser.hooks.traverse.for('img').tap('ResponsiveImage', (context, node) => {
      return node
    })
  }
}