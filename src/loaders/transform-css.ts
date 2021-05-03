import type webpack from 'webpack'
import type {Compiler} from '../interfaces'
import debug from '../debug'

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

  // only transform css if there is an @apply
  const hasWindiApply = source.indexOf('@apply') > -1
  if (!hasWindiApply) {
    debug.loader('Skipping CSS transform, no @apply', this.resource)
    return source
  }

  let output = source
  try {
    output = service.transformCSS(source, this.resource)
    debug.loader('Transformed CSS', this.resource)
  } catch (e) {
    this.emitWarning(`[Windi CSS] Failed to css for resource: ${this.resource}.`)
  }
  return output
}

export default TransformCss
