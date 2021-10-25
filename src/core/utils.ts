import {HAS_DIRECTIVE_TEST, HAS_THEME_FUNCTION_TEST} from "./constants";

export const cssRequiresTransform = (source: string) => {
  return HAS_DIRECTIVE_TEST.test(source) || HAS_THEME_FUNCTION_TEST.test(source)
}

export const isJsx = (source: string) => {
  return /{`(.*)`}/gms.test(source)
}
