const path = require("path");
const webpack = require("webpack");
const WebpackWindiCSSPlugin = require ('../../dist').default

module.exports = (config = {}) => {
  const root = path.dirname(__dirname)
  return webpack({
    entry: `./fixtures/react.js`,
    context: root,
    mode: 'development',
    devtool: false,
    output: {
      path: path.join(root, '/dist'),
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'css-loader'
          ]
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-react']
              ]
            }
          }
        },
      ]
    },
    plugins: [
      new WebpackWindiCSSPlugin({
        scan: {
          dirs: ['fixtures']
        }
      }),
    ],
    ...config,
  });
}
