import { describe, it, expect } from 'vitest'
import { getModuleSource, vueWebpackCompiler } from './helpers'

describe("Directives test", function() {

  it('should render vue', done => {
    const compiler = vueWebpackCompiler('vue-directives')
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])
      const windiComponents = getModuleSource('virtual:windi-components.css', stats)
      expect(windiComponents).toContain('.bar')
      expect(windiComponents).toMatchSnapshot('windi components')

      done(err)
    });
  });
});
