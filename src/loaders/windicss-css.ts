import type { loader } from 'webpack'
import { transformCSS } from '../core/utils'

function WindicssCss(
  this: loader.LoaderContext,
  source: string,
): string {
  if (!this._compiler)
    return source

  this.cacheable(true)
  // @ts-expect-error untyped
  const service = this._compiler.$windi

  if (!service)
    return source

  return transformCSS(service, source, this.resource)
}

export default WindicssCss
