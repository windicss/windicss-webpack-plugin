import path from 'path'
import webpack from 'webpack'
import WebpackWindiCSSPlugin from '../../dist/plugin.mjs'

export function reactWebpackCompiler (type = 'react', config = {}) {
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
        root: context,
        ...config,
      }),
    ],
  });
}
