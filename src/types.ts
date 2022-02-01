import type webpack from 'webpack'
import type { WindiPluginUtils, UserOptions } from '@windicss/plugin-utils'

// virtual module prefix
// @ts-expect-error virtual module
declare module 'virtual:windi.css' {}
// @ts-expect-error virtual module
declare module 'virtual:windi-base.css' {}
// @ts-expect-error virtual module
declare module 'virtual:windi-components.css' {}
// @ts-expect-error virtual module
declare module 'virtual:windi-utilities.css' {}

// no prefix
// @ts-expect-error virtual module
declare module 'windi.css' {}
// @ts-expect-error virtual module
declare module 'windi-base.css' {}
// @ts-expect-error virtual module
declare module 'windi-components.css' {}
// @ts-expect-error virtual module
declare module 'windi-utilities.css' {}

export type Compiler = webpack.Compiler & {
  $windi: WindiPluginUtils & {
    dirty: Set<string>
    root: string
    virtualModules: Map<string, string>
    initException?: Error
  }
}

export type WindiCSSWebpackPluginOptions = UserOptions & {
  /**
   * Reuse existing utils if exists
   */
  utils?: WindiPluginUtils
  /**
   * The path where the virtual module should be injected. By default this is the project root but for
   * some projects (such as craco), specifying the directory is needed.
   *
   * @default ''
   */
  virtualModulePath: string
}
