import { defineConfig } from 'umi';
import WindiCSSWebpackPlugin from 'windicss-webpack-plugin'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  // must be disabled
  // see: https://github.com/umijs/umi/issues/7303
  mfsu: false,
  fastRefresh: {},
  chainWebpack(config : any) {
    config
      .plugin('windicss')
      .use(WindiCSSWebpackPlugin);
  },
});
