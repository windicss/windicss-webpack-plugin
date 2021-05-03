import type webpack from 'webpack'
import type {Compiler} from '../interfaces'
import { relative } from 'path'
import debug from '../debug'

function TransformTemplate(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  if (!this._compiler) {
    return source
  }
  this.cacheable(true)
  const service = (this._compiler as Compiler).$windyCSSService

  if (!service) {
    return source
  }

  const hasHtmlWebpackPlugin = this.loaders.filter(loader => {
    // loader name as unresolved module
    return(loader.loader && loader.loader.indexOf('html-webpack-plugin') > 0)
      // resolved loader name as path
      || (loader.path && loader.path.indexOf('html-webpack-plugin') > 0)
  }).length > 0

  // This breaks the loader
  if (hasHtmlWebpackPlugin) {
    const root = this._compiler.context
    this.emitError(`Please exclude the resource ${relative(root, this.resourcePath)} from your windi scan config.`)
    return source
  }

  let output = source
  try {
    const templateWithTransformedCSS = source.replace(/<style(.*?)>(.*)<\/style>/gms, (match, meta, css) => {
      // if there's no windi code going on then we shouldn't transform anything
      const hasWindiApply = match.indexOf('@apply') > -1
      // windi does not support certain types of css langs
      const isUnsupportedBlock = meta.indexOf('sass') > -1 || meta.indexOf('stylus') > -1 || meta.indexOf('less') > -1
      // bail out, return the original match
      if (!hasWindiApply || isUnsupportedBlock) {
        debug.loader('skipping resource', this.resource)
        return match
      }
      // for jsx styles we need to replace the contents of template strings
      if (/{`(.*)`}/gms.test(css)) {
        let m, transformedCSS;
        const jsxMatcher = /{`(.*)`}/gms
        while ((m = jsxMatcher.exec(css)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === jsxMatcher.lastIndex) {
            jsxMatcher.lastIndex++;
          }
          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
              transformedCSS = `<style${meta}>\n{\`${service.transformCSS(match, this.resource)}\n\`}</style>`
              debug.loader('jsx transformed', transformedCSS)
            }
          });
        }
        return transformedCSS ?? match
      }
      return `<style${meta}>\n${service.transformCSS(css, this.resource)}\n</style>`
    })
    debug.loader('template', this.resource, templateWithTransformedCSS)
    output = service.transformGroups(templateWithTransformedCSS)
  } catch (e) {
    this.emitWarning(`[Windi CSS] Failed to transform groups and css for template: ${this.resource}.`)
  }
  return output
}

export default TransformTemplate
