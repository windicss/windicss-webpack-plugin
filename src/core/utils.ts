import type { WindiPluginUtils } from '@windicss/plugin-utils'
import type webpack from 'webpack'
import { HAS_DIRECTIVE_TEST, HAS_THEME_FUNCTION_TEST, MODULE_ID_VIRTUAL_PREFIX } from './constants'
import debug from './debug'

export const cssRequiresTransform = (source: string) => {
  return HAS_DIRECTIVE_TEST.test(source) || HAS_THEME_FUNCTION_TEST.test(source)
}

export const isJsx = (source: string) => {
  return /{`(.*)`}/gms.test(source)
}

export const transformCSS = (service: WindiPluginUtils, source: string, resource: string) => {
  if (!source || source.length <= 0)
    return source

  // make sure the transform is required, can be expensive
  if (!cssRequiresTransform(source))
    return source

  let output = source
  try {
    output = service.transformCSS(source, resource, { globaliseKeyframes: true })
    if (!output || output.length <= 0) {
      debug.loader(`[WindiCSS] Invalid response from windi core transforming resource: ${resource}.`)
      return source
    }
    debug.loader('Transformed CSS', resource)
  }
  catch (e) {
    debug.loader(`[WindiCSS] Exception when transforming CSS for resource: ${resource}.`, e)
    return source
  }
  return output
}

/**
 * Default function. Take the value or the default
 */
export const def = (val: any, def: any) => {
  if (val)
    return val

  return def
}

export function getChangedModuleNames(utils: WindiPluginUtils) {
  if (utils.hasPending)
    utils.buildPendingStyles()

  const moduleNames = [
    `${MODULE_ID_VIRTUAL_PREFIX}.css`,
  ]

  Object.entries(utils.layersMeta).forEach(([name, meta]) => {
    if (meta.cssCache == null)
      moduleNames.push(`${MODULE_ID_VIRTUAL_PREFIX}-${name}.css`)
  })

  return moduleNames
}

export const isDev = () => process.env.NODE_ENV === 'development'

export const isWebCompilerTarget = (target: webpack.Configuration['target']) => {
  let isWeb = true
  if (typeof target === 'string') {
    isWeb = !target.includes('node')
  }
  else if (Array.isArray(target)) {
    target.forEach((str) => {
      if (str.includes('node'))
        isWeb = false
    })
  }
  else {
    isWeb = false
  }
  return isWeb
}
