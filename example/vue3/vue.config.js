const {WindiCSSWebpackPlugin} = require('../../dist')

module.exports = {
  configureWebpack: {
    plugins: [
      new WindiCSSWebpackPlugin({
        scan: {
          dirs: ['./src'],
          exclude: ['public/**/*'],
        },
      }),
    ],
  },
}
