const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new WindiCSSWebpackPlugin,
    ],
  },
}
