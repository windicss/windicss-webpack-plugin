import type webpack from 'webpack'
import type { Compiler } from '../interfaces'
import { transformCSS } from '../core/utils'

function WindicssCss(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  if (!this._compiler)
    return source

  this.cacheable(true)
  const service = (this._compiler as Compiler).$windi

  if (!service)
    return source

  return transformCSS(service, source, this.resource)
}

export default WindicssCss
