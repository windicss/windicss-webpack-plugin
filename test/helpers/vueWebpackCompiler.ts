import path from 'path'
import webpack from 'webpack'
import WebpackWindiCSSPlugin from '../../dist/plugin.mjs'
import VueLoaderPlugin from 'vue-loader/lib/plugin'

export function vueWebpackCompiler (type = 'vue', config = {}) {
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
          resourceQuery: /blockType=i18n/,
          type: 'javascript/auto',
          loader: '@intlify/vue-i18n-loader',
        },
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
