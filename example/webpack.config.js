const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ResponsiveImage = require('../responsive-image')

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: [{
          loader: 'html-loader',
        },{
          loader: path.resolve(__dirname, '../index'),
          options: {
            plugins: [
              new ResponsiveImage()
            ]
          }
        }]
      }      
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
    // new HtmlWebpackPlugin()
  ],
  devServer: {
    
  },
}