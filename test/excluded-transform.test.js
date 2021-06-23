"use strict";

const getModuleSource = require('./helpers/getModuleSource')
const vueWebpackCompiler = require ('./helpers/vueWebpackCompiler')

describe("Excluded transform", function() {

  it('should render vue', done => {
    const compiler = vueWebpackCompiler('excluded-transform', {
      scan: {
        extraTransformTargets: {
          detect: [],
          css: [
            (resource) => {
              return resource.indexOf('should-transform.css') >= 0
            }

          ]
        }
      }
    })
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])

      const toNotTransformCss = getModuleSource('should-not-transform', stats)
      expect(toNotTransformCss).toContain('theme(')

      // check the windi file has generated the right classes
      const toTransformCss = getModuleSource('should-transform', stats)
      expect(toTransformCss).not.toContain('theme(')

      done(err)
    });
  });
});
