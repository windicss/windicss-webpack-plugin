import webpack from 'webpack'
import type { WindiPluginUtils, UserOptions } from '@windicss/plugin-utils'

type Compiler = webpack.Compiler & {
  $windyCSSService?: WindiPluginUtils & {
    dirty: Set<string>
    root: string
    initException?: Error
  }
}

type Options = UserOptions & {
  /**
   * Reuse existing utils if exists
   */
  utils?: WindiPluginUtils
  // add custom webpack options here
}

export {
  Compiler,
  Options,
}
