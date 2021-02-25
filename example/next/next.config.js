const WindiCSSWebpackPlugin = require('../../dist/index.js')

module.exports = {
  webpack: config => {
    config.plugins.push(new WindiCSSWebpackPlugin({
      scan: {
        dirs: ['./'],
        exclude: ['.next/**/*'],
      },

    }))
    return config
  },
}
