const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')

module.exports = {
  webpack: {
    plugins: {
      add: [
        new WindiCSSWebpackPlugin({
          virtualModulePath: 'src'
        })
      ],
    },
  },
}
