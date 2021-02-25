import webpack from 'webpack'
import type {WindiPluginUtils, UserOptions} from '@windicss/plugin-utils'

type Compiler = webpack.Compiler & {
  $windyCSSService?: WindiPluginUtils & {
    dirty: Set<string>;
    requestVirtualModuleUpdate: (id: string, css?: string) => void;
    root: string;
  };
}

type Options = UserOptions & {

}

export {
  Compiler,
  Options,
}
