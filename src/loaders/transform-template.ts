import type webpack from 'webpack'
import type { Compiler } from '../interfaces'
import debug from '../debug'
const compileTemplate = require('lodash/template')
const defaults = require('lodash/defaults')
const loaderUtils = require('loader-utils')

function TransformTemplate(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  if (!this._compiler)
    return source

  this.cacheable(true)
  const service = (this._compiler as Compiler).$windyCSSService

  if (!service)
    return source

  /*
   * Via the pitcher loader we can transfer post-interpreted CSS
   */
  if (this.resource.indexOf('type=style') > 0)
    return service.transformCSS(source, this.resource)

  const hasHtmlWebpackPlugin = this.loaders.filter((loader) => {
    // loader name as unresolved module
    return (loader.loader && loader.loader.indexOf('html-webpack-plugin') > 0)
      // resolved loader name as path
      || (loader.path && loader.path.indexOf('html-webpack-plugin') > 0)
  }).length > 0

  if (hasHtmlWebpackPlugin) {
    /*
     * Because the html-webpack-plugin doesn't support multiple loaders, we need to replicate the behaviour of the plugin
     * here, this is pretty hacky but haven't been able to find a solution. @todo find a better solution
     *
     * Source: html-webpack-plugin/lib/loader.js
     */
    const options = this.query !== '' ? loaderUtils.parseQuery(this.query) : {}
    const template = compileTemplate(source, defaults(options, { variable: 'data' }))
    // Require !!lodash - using !! will disable all loaders (e.g. babel)
    return `var _ = require(${loaderUtils.stringifyRequest(this, `!!${require.resolve('lodash')}`)});`
      + 'module.exports = function (templateParams) { with(templateParams) {'
      // Execute the lodash template
      + `return (${template.source})();`
      + '}}'
  }

  let output = source
  try {
    const templateWithTransformedCSS = source.replace(/<style(.*?)>(.*)<\/style>/gms, (match, meta, css) => {
      // if there's no windi code going on then we shouldn't transform anything
      const hasWindiApply = match.includes('@apply')
      // windi does not support certain types of css langs
      const isUnsupportedBlock = meta.includes('sass') || meta.includes('stylus') || meta.includes('less')
      // bail out, return the original match
      if (!hasWindiApply || isUnsupportedBlock) {
        debug.loader('Template has unsupported block, skipping resource', this.resource)
        return match
      }
      // for jsx styles we need to replace the contents of template strings
      if (/{`(.*)`}/gms.test(css)) {
        let m, transformedCSS
        const jsxMatcher = /{`(.*)`}/gms
        while ((m = jsxMatcher.exec(css)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === jsxMatcher.lastIndex)
            jsxMatcher.lastIndex++

          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
              transformedCSS = `<style${meta}>\n{\`${service.transformCSS(match, this.resource)}\n\`}</style>`
              debug.loader('jsx transformed', transformedCSS)
            }
          })
        }
        return transformedCSS ?? match
      }
      return `<style${meta}>\n${service.transformCSS(css, this.resource)}\n</style>`
    })
    debug.loader('Transformed template ', this.resource)
    const transformed = service.transformGroups(templateWithTransformedCSS)
    if (transformed)
      output = transformed.code
    else
      output = templateWithTransformedCSS
  }
  catch (e) {
    this.emitWarning(`[Windi CSS] Failed to transform groups and css for template: ${this.resource}.`)
  }
  return output
}

export default TransformTemplate
