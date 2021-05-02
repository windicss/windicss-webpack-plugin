import type webpack from 'webpack'
import type {Compiler} from '../interfaces'

function TransformCss(
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

  let output = source
  try {
    output = service.transformCSS(source, this.resource)
  } catch (e) {
    this.emitWarning(`[Windi CSS] Failed to css for resource: ${this.resource}.`)
  }
  return output
}

export default TransformCss
