const WindiCSSWebpackPlugin = require('../../dist/index.js').default

module.exports = {
  webpack: config => {
    config.plugins.push(new WindiCSSWebpackPlugin({
      scan: {
        dirs: ['./'],
        exclude: ['node_modules', '.git', '.next/**/*'],
      },

    }))
    return config
  },
}
