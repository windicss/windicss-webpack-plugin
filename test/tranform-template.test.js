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
      done(err)
    });
  });
});
