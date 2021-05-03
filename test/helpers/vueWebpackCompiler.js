const path = require("path");
const webpack = require("webpack");
const WebpackWindiCSSPlugin = require ('../../dist').default
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = (config = {}) => {
  const root = path.dirname(__dirname)
  return webpack({
    entry: `./fixtures/vue.js`,
    context: root,
    mode: 'development',
    devtool: 'source-map',
    output: {
      path: path.join(root, '/dist'),
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        }
      ]
    },
    plugins: [
      new WebpackWindiCSSPlugin({
        scan: {
          dirs: ['fixtures']
        }
      }),
      new VueLoaderPlugin()
    ],
    ...config,
  });
}
