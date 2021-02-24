import type webpack from 'webpack'
import type {Compiler} from '../interfaces'

function TransformCss(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  const service = (this._compiler as Compiler).$windyCSSService

  if (!service) {
    return source
  }

  return service.transformCSS(source)
}

export default TransformCss
