import webpack from 'webpack'
import type { WindiPluginUtils, UserOptions } from '@windicss/plugin-utils'

type Compiler = webpack.Compiler & {
  $windyCSSService?: WindiPluginUtils & {
    dirty: Set<string>
    root: string
    virtualModules: Map<string, string>
    initException?: Error
  }
}

type Options = UserOptions & {
  /**
   * Reuse existing utils if exists
   */
  utils?: WindiPluginUtils
  /**
   * The path where the virtual module should be injected. By default this is the project root but for
   * some projects (such as craco), specifying the directory is needed.
   */
  virtualModulePath?: string
}

export {
  Compiler,
  Options,
}
