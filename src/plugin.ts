import { Compiler } from './interfaces'
import { getOptions } from './options'
import loader from './loader'
import { Processor } from "windicss/lib";

class WindyCSSWebpackPluginVue {
	options

	/**
	 * @param {Options} options
	 */
	constructor(options = {}) {
		this.options = getOptions(options);
	}

	apply(compiler: Compiler): void {
		// add the loader
		compiler.plugin('windycssVue', windycssVue => {
			windycssVue.plugin('after-resolve', (data, callback) => {
				data.loaders.push({
					test: /\.vue$/,
					enforce: 'pre',
					loader,
					options: this.options
				});
				callback(null, data);
			});
		});

		let watching = false;

		const safeStartService = async () => {
			if (!compiler.$windycssService) {
				compiler.$windycssService = await startService();
			}
		};

		compiler.hooks.thisCompilation.tap('windycss', compilation => {
			compilation.hooks.childCompiler.tap('windycss', childCompiler => {
				childCompiler.$windycssService = compiler.$windycssService;
			});
		});

		compiler.hooks.run.tapPromise('windycss', async () => {
			await safeStartService();
		});

		compiler.hooks.watchRun.tapPromise('windycss', async () => {
			watching = true;
			await safeStartService();
		});

		compiler.hooks.done.tap('esbuild', () => {
			if (!watching && compiler.$windycssService) {
				compiler.$windycssService.stop();
				compiler.$windycssService = undefined;
			}
		});
	}
}

export default WindyCSSWebpackPluginVue;
