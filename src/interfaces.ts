import webpack from 'webpack'
import type {WindiPluginUtils} from '@windicss/plugin-utils'

type Compiler = webpack.Compiler & {
  $windyCSSService?: WindiPluginUtils & {
    dirty: Set<string>;
    requestVirtualModuleUpdate: (id: string) => void;
    root: string;
  };
}

export {
  Compiler,
}
