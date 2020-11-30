const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './index.js',
  module: {
    // rules: [
    //   {
    //     test: /\.(html)$/,
    //     use: {
    //       loader: 'html-loader',
    //     }
    //   }      
    // ]
  },
  plugins: [
    // new HtmlWebpackPlugin()
  ],
  devServer: {
    
  },
}