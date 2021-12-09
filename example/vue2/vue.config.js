const WindiCSSWebpackPlugin = require('windicss-webpack-plugin')

module.exports = {

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
      enableBridge: false
    }
  },
  configureWebpack: {
    plugins: [
      new WindiCSSWebpackPlugin,
    ],
  },
}
