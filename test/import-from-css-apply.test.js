"use strict";

const getModuleSource = require('./helpers/getModuleSource')
const vueWebpackCompiler = require ('./helpers/vueWebpackCompiler')

describe("@import css with @apply", function() {

  it('should render vue', done => {
    const compiler = vueWebpackCompiler('import-css-with-apply', )
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])

      const toNotTransformCss = getModuleSource('global.css', stats)
      expect(toNotTransformCss).not.toContain('@apply')
      expect(toNotTransformCss).toMatchSnapshot('@apply')

      done(err)
    });
  });
});
