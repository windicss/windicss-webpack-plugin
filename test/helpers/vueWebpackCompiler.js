const path = require("path");
const webpack = require("webpack");
const WebpackWindiCSSPlugin = require ('../../dist/plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = (type = 'vue', config = {}) => {
  const root = path.dirname(__dirname)
  const context = path.join(root, 'fixtures', type)
  return webpack({
    entry: `./index.js`,
    context,
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
            'vue-style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.sass$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  indentedSyntax: true
                }
              }
            }
          ]
        },
        {
          test: /\.less$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'stylus-loader'
          ]
        },
      ]
    },
    plugins: [
      new WebpackWindiCSSPlugin({
        root: context,
        ...config,
      }),
      new VueLoaderPlugin()
    ],
  });
}
