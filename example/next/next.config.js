const WindiCSSWebpackPlugin = require('../../dist').default

module.exports = {
  webpack: config => {
    config.plugins.push(new WindiCSSWebpackPlugin())
    return config
  },
}
