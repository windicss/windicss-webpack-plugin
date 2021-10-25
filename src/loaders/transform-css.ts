import type webpack from 'webpack'
import type { Compiler } from '../interfaces'
import debug from '../core/debug'

function TransformCss(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  if (!this._compiler)
    return source

  this.cacheable(true)
  const service = (this._compiler as Compiler).$windyCSSService

  if (!service)
    return source

  let output = source
  try {
    output = service.transformCSS(source, this.resource)
    debug.loader('Transformed CSS', this.resource)
  }
  catch (e) {
    this.emitWarning(`[Windi CSS] Failed to css for resource: ${this.resource}.`)
  }
  return output || source
}

export default TransformCss
