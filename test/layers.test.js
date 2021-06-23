"use strict";

const getModuleSource = require('./helpers/getModuleSource')
const vueWebpackCompiler = require ('./helpers/vueWebpackCompiler')
const reactWebpackCompiler = require ('./helpers/reactWebpackCompiler')

describe("Layers test", function() {

  it('should render vue', done => {
    const compiler = vueWebpackCompiler('vue-layers')
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])
      // check the windi file has generated the right classes
      const windiBase = getModuleSource('virtual:windi-base.css', stats)
      expect(windiBase).toContain('body {')
      expect(windiBase).toMatchSnapshot('windi base')

      const windiComponents = getModuleSource('virtual:windi-components.css', stats)
      expect(windiComponents).toContain('windicss layer components')
      expect(windiComponents).toMatchSnapshot('windi components')

      const windiUtils = getModuleSource('virtual:windi-utilities.css', stats)
      expect(windiUtils).toContain('bg-teal-900:hover')
      expect(windiUtils).toMatchSnapshot('windi utilities')

      done(err)
    });
  });
  it('should render react', done => {
    const compiler = reactWebpackCompiler('react-layers')
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])
      // check the windi file has generated the right classes
      const windiBase = getModuleSource('virtual:windi-base.css', stats)
      expect(windiBase).toContain('body {')
      expect(windiBase).toMatchSnapshot('windi base')

      const windiComponents = getModuleSource('virtual:windi-components.css', stats)
      expect(windiComponents).toContain('windicss layer components')
      expect(windiComponents).toMatchSnapshot('windi components')

      const windiUtils = getModuleSource('virtual:windi-utilities.css', stats)
      expect(windiUtils).toContain('bg-blue-500:hover')
      expect(windiUtils).toMatchSnapshot('windi utilities')

      done(err)
    });
  });
});
