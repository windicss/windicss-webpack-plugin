import type { UserOptions, WindiPluginUtils } from '@windicss/plugin-utils'
import type Server from './core/server'

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

declare module 'webpack' {
  interface Compiler {
    $windi: WindiPluginUtils & {
      dirty: Set<string>
      root: string
      virtualModules: Map<string, string>
      initException?: Error
      invalidateCssModules: (resource: string, modules: string[]) => void
      server: Server
    }
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
  /**
   * Options for devtools backend server.
   */
  server?: {
    /**
     * Port for devtools backend server.
     *
     * @default 8888
     */
    port?: number
    /**
     * Host for devtools backend server.
     *
     * @default '127.0.0.1'
     */
    host?: string
  }
}
