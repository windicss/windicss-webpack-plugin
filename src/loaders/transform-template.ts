import type webpack from 'webpack'
import type {Compiler} from '../interfaces'

function TransformTemplate(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  const service = (this._compiler as Compiler).$windyCSSService

  if (!service) {
    return source
  }

  const hasHtmlWebpackPlugin = this.loaders.filter(loader => {
    return loader.loader && loader.loader.indexOf('html-webpack-plugin') > 0
  }).length > 0
  // This breaks the loader
  if (hasHtmlWebpackPlugin) {
    return source
  }

  let output = source
  try {
    output = service.transformGroups(source.replace(/<style(.*?)>((.|\s)*)<\/style>/gm, (match, meta, css) => {
      // don't transform languages that aren't supported
      // see: https://github.com/windicss/nuxt-windicss-module/issues/13
      // @todo setup pitcher for styles
      if (meta.indexOf('sass') > -1 || meta.indexOf('stylus') > -1 || meta.indexOf('less') > -1) {
        return `<style${meta}>\n${css}\n</style>`
      }
      return `<style${meta}>\n${service.transformCSS(css)}\n</style>`
    }))
  } catch (e) {
    this.emitWarning(`[Windi CSS] Failed to transform groups and css for template: ${this.resource}.`)
  }
  return output
}

export default TransformTemplate
