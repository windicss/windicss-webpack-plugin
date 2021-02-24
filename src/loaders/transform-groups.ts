import type webpack from 'webpack';
import type {Compiler} from '../interfaces';

function TransformGroups(
  this: webpack.loader.LoaderContext,
  source: string,
): string {
  const service = (this._compiler as Compiler).$windyCSSService;

  if (!service) {
    return source;
  }

  const hasHtmlWebpackPlugin = this.loaders.filter(loader => {
    return loader.loader && loader.loader.indexOf('html-webpack-plugin') > 0;
  }).length > 0;
  // This breaks the loader
  if (hasHtmlWebpackPlugin) {
    return source;
  }

  return service.transfromGroups(source);
}

export default TransformGroups;
