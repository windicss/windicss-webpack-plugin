import { WindiPluginUtils } from '@windicss/plugin-utils'
import { HAS_DIRECTIVE_TEST, HAS_THEME_FUNCTION_TEST } from './constants'
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
      console.warn(`[WindiCSS] Failed to transform CSS for resource: ${resource}.`)
      return source
    }
    debug.loader('Transformed CSS', resource)
  }
  catch (e) {
    console.warn(`[WindiCSS] Failed to transform CSS for resource: ${resource}.`)
    return source
  }
  return output
}
