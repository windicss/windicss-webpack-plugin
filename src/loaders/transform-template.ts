import type webpack from 'webpack'
import type {Compiler} from '../interfaces'
import { relative } from 'path'

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
    // @ts-ignore
    output = service.transformGroups(source.replace(/<style(.*?)>((.|\s)*)<\/style>/gm, (match, meta, css) => {
      // don't transform languages that aren't supported
      // see: https://github.com/windicss/nuxt-windicss-module/issues/13
      // @todo setup pitcher for styles
      if (meta.indexOf('sass') > -1 || meta.indexOf('stylus') > -1 || meta.indexOf('less') > -1) {
        return `<style${meta}>\n${css}\n</style>`
      }
      return `<style${meta}>\n${service.transformCSS(css, this.resource)}\n</style>`
    }))
  } catch (e) {
    this.emitWarning(`[Windi CSS] Failed to transform groups and css for template: ${this.resource}.`)
  }
  return output
}

export default TransformTemplate
