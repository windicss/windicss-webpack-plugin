const WindiCSS = require('../../dist').default

module.exports = {
  configureWebpack: {
    plugins: [
      new WindiCSS,
    ],
  },
}
