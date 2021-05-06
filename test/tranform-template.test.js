"use strict";

const getModuleSource = require('./helpers/getModuleSource')
const vueWebpackCompiler = require ('./helpers/vueWebpackCompiler')
const reactWebpackCompiler = require ('./helpers/reactWebpackCompiler')

describe("Transform template test", function() {

  it("should render jsx", done => {
    const compiler = reactWebpackCompiler()
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])
      const transformedLayout = getModuleSource('layout.jsx', stats)
      expect(transformedLayout).not.toContain('@apply')
      expect(transformedLayout).toMatchSnapshot()
      // check the windi file has generated the right classes
      const windi = getModuleSource('virtual:windi.css', stats)
      expect(windi).toContain('bg-blue-500')
      expect(windi).toMatchSnapshot('vue windi')
      done(err)
    });
  });

  it('should render vue', done => {
    const compiler = vueWebpackCompiler()
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])
      const transformedLayout = getModuleSource('App.vue?vue&type=template', stats)
      expect(transformedLayout).not.toContain('hover:(text-green-100 rounded-full bg-teal-900)')
      expect(transformedLayout).toMatchSnapshot('vue template')
      // check the windi file has generated the right classes
      const windi = getModuleSource('virtual:windi.css', stats)
      expect(windi).toContain('text-green-100')
      expect(windi).toMatchSnapshot('vue windi')

      const scss = getModuleSource('main.scss', stats)
      expect(scss).not.toContain('@apply')
      expect(scss).toMatchSnapshot('vue scss')

      const sass = getModuleSource('main.sass', stats)
      expect(sass).not.toContain('@apply')
      expect(sass).toMatchSnapshot('vue sass')

      const less = getModuleSource('main.less', stats)
      expect(less).not.toContain('@apply')
      expect(less).toMatchSnapshot('vue less')

      const css = getModuleSource('plain.css', stats)
      expect(css).not.toContain('@apply')
      expect(css).toMatchSnapshot('vue css')
      done(err)
    });
  });
});
