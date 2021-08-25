import WindiCSS from '../../dist'

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
      new WindiCSS,
    ],
  },
}
