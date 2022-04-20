import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
    cjsBridge: true,
    esbuild: {
      target: 'es2019'
    }
  },
  clean: true,
  entries: [
    'src/plugin',
    // loaders aren't part of the plugin entry
    { input: 'src/loaders/dev-tools', name: 'loaders/dev-tools', declaration: false, format: 'cjs', ext: 'cjs'  },
    { input: 'src/loaders/virtual-module', name: 'loaders/virtual-module', declaration: false, format: 'cjs', ext: 'cjs'  },
    { input: 'src/loaders/windicss-css', name: 'loaders/windicss-css', declaration: false, format: 'cjs', ext: 'cjs' },
    { input: 'src/loaders/windicss-style-pitcher', name: 'loaders/windicss-style-pitcher', declaration: false, format: 'cjs', ext: 'cjs' },
    { input: 'src/loaders/windicss-template', name: 'loaders/windicss-template', declaration: false, format: 'cjs', ext: 'cjs'  },
  ],
  externals: [
    'webpack',
  ],
})
