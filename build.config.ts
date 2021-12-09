import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
    cjsBridge: true,
  },
  clean: true,
  entries: [
    'src/plugin',
    { input: 'src/core', outDir: 'dist/core', builder: 'mkdist', format: 'cjs', ext: 'js', declaration: false },
    { input: 'src/loaders', outDir: 'dist/loaders', builder: 'mkdist', format: 'cjs', ext: 'js', declaration: false },
    { input: 'types', outDir: 'dist', builder: 'mkdist' },
  ],
  externals: [
    'webpack',
  ],
})
