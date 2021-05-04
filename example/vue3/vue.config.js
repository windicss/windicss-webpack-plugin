const WindiCSSWebpackPlugin = require('../../dist').default

module.exports = {
  configureWebpack: {
    plugins: [
      new WindiCSSWebpackPlugin({
        scan: {
          dirs: ['./src'],
          exclude: ['node_modules', '.git'],
        },
      }),
    ],
  },
}
