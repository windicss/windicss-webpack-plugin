import webpack from 'webpack';
import type { WindiPluginUtils } from '@windicss/plugin-utils'

type Compiler = webpack.Compiler & {
	$windyCSSService?: WindiPluginUtils
}

export {
	Compiler,
}
