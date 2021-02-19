import {getOptions} from 'loader-utils';
import webpack from 'webpack';
import {Compiler, LoaderOptions} from './interfaces';

async function WindiCSSVueLoader(
	this: webpack.loader.LoaderContext,
	source: string,
): Promise<void> {
	const done = this.async()!;
	const options: LoaderOptions = getOptions(this);
	const service = (this._compiler as Compiler).$windycssService;

	if (!service) {
		done(
			new Error(
				'[esbuild-loader] You need to add ESBuildPlugin to your webpack config first',
			),
		);
		return;
	}

	const transformOptions = {
		...options,
		target: options.target ?? 'es2015',
		loader: options.loader ?? 'js',
		sourcemap: this.sourceMap,
		sourcefile: this.resourcePath,
	};

	try {
		const { code, map } = await service.transform(source, transformOptions);
		done(null, code, map && JSON.parse(map));
	} catch (error: unknown) {
		done(error as Error);
	}
}

export default WindiCSSVueLoader;
