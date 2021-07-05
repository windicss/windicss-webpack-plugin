// const WindiCSS = require('windicss-webpack-plugin').default
const WindiCSS = require('../../dist').default

module.exports = {
  webpack: {
    plugins: {
      add: [
        new WindiCSS({
          virtualModulePath: 'src'
        })
      ],
    },
  },
}
