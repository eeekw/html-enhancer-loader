const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ResponsiveImagePlugin = require('../lib/responsive-image-plugin')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './main.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.undefined$/,
        resourceQuery: /^\?vue/,
        use: [
          {
            loader: 'html-enhancer-loader',
            options: {
              plugins: [new ResponsiveImagePlugin()]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new VueLoaderPlugin()
  ],
  devServer: {

  },
  resolveLoader: {
    alias: {
      'html-enhancer-loader': require.resolve('../lib')
    }
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js'
    }
  }
}