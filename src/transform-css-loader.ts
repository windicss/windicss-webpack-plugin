import type webpack from 'webpack'
import type { Compiler } from './interfaces'

function TransformCssLoader(
	this: webpack.loader.LoaderContext,
	source: string,
): String {
	const service = (this._compiler as Compiler).$windyCSSService

	if (!service) {
		return source
	}

	return service.transformCSS(source)
}

export default TransformCssLoader
