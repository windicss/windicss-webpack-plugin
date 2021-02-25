import WindiCSSWebpackPlugin from '../../dist/index.js'

module.exports = {
  css: [
    '@/assets/css/test.css',
  ],
  plugins: [
    '@/plugins/windicss.js',
  ],
  components: true,
  build: {
    plugins: [
      new WindiCSSWebpackPlugin({
        scan: {
          dirs: ['./'],
          exclude: ['.nuxt/**/*'],
        },
      }),
    ],
  },
}
