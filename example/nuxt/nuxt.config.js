import WindiCSSWebpackPlugin from '../../dist/index.js'

module.exports = {
  css: [
    '@/assets/css/test.css',
    '@/assets/css/main.scss',
  ],
  plugins: [
    '@/plugins/windicss.js',
  ],
  components: true,
  build: {
    postcss: false,
    plugins: [
      new WindiCSSWebpackPlugin,
    ],
  },
}
