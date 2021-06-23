"use strict";

const getModuleSource = require('./helpers/getModuleSource')
const vueWebpackCompiler = require ('./helpers/vueWebpackCompiler')

describe("Excluded transform", function() {

  it('should render vue', done => {
    const compiler = vueWebpackCompiler('excluded-transform', {
      scan: {
        extraTransformTargets: {
          detect: [
            i => {
              console.log('template --> ', i)
              return false
            }
          ],
          css: [
            (resource) => {
              return resource.indexOf('node_modules_demo/my-package/should-transform.css') >= 0
            }

          ]
        }
      }
    })
    compiler.run((err, stats) => {
      expect(stats.compilation.errors).toStrictEqual([])

      const toNotTransformCss = getModuleSource('should-not-transform', stats)
      expect(toNotTransformCss).toContain('theme(')
      expect(toNotTransformCss).toMatchSnapshot('should not transform')

      // check the windi file has generated the right classes
      const toTransformCss = getModuleSource('should-transform', stats)
      expect(toTransformCss).not.toContain('theme(')
      expect(toTransformCss).toMatchSnapshot('should transform')

      done(err)
    });
  });
});
