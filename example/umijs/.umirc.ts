import { defineConfig } from 'umi';
import WindiCSSWebpackPlugin from '../../dist/index.js'

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
      .plugin('clean')
      .use(WindiCSSWebpackPlugin, [{
        scan: {
          dirs: ['./'],
          exclude: ['node_modules', '.git', 'dist', 'mock', '.umi'],
        },
      }]);
  },
});
