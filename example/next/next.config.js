// const WindiCSS = require('windicss-webpack-plugin').default
const WindiCSS = require('../../dist').default

module.exports = {
  webpack: config => {
    config.plugins.push(new WindiCSS())
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
