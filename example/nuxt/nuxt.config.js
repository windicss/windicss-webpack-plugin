import WindiCSSWebpackPlugin from 'windicss-webpack-plugin'

module.exports = {
  css: [
    '@/assets/css/test.css',
    '@/assets/css/main.scss',
    '@/assets/styles/windi.css',
    '@/assets/styles/layout.sass',
  ],
  plugins: [
    '@/plugins/windicss.js',
  ],
  components: true,
  build: {
    plugins: [
      new WindiCSSWebpackPlugin,
    ],
  },
}
