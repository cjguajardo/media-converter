// import path from 'path'
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'server.js',
  },
  target: 'node',
  stats: {
    errorDetails: true
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^sharp$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^express$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^playwright$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^iconv-lite$/
    })
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
}