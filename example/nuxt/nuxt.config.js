import WindiCSS from '../../dist'

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
    plugins: [
      new WindiCSS,
    ],
  },
}
