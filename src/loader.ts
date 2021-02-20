import type webpack from 'webpack'
import type { Compiler } from './interfaces'
import { WindiPluginUtils } from "@windicss/plugin-utils";

async function WindiCssLoader(
	this: webpack.loader.LoaderContext,
	source: string,
): Promise<void> {
	const done = this.async()!;
	const service = (this._compiler as Compiler).$windyCSSService as WindiPluginUtils;

	try {
		service.extractFile(source)
		done(null, source);
	} catch (error: unknown) {
		done(error as Error);
	}
}

export default WindiCssLoader;
