import { defineConfig } from 'umi';
import WindiCSS from '../../dist'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
  chainWebpack(config : any) {
    config
      .plugin('windicss')
      .use(WindiCSS);
  },
});
