import { Compiler } from './interfaces'
import { UserOptions, createUtils } from '@windicss/plugin-utils'
import VirtualModulesPlugin from 'webpack-virtual-modules'
// import HtmlWebpackPlugin from 'html-webpack-plugin'

const id = 'windicss-webpack-plugin'

class WindiCSSWebpackPlugin {
	options

	constructor(options : UserOptions = {}) {
		// @todo validate options
		this.options = options
	}

	apply(compiler: Compiler): void {

		// Solution 1: Use a virtual module
		const virtualModules = new VirtualModulesPlugin()
		// @ts-ignore
		compiler.options.plugins.push(virtualModules)
		compiler.hooks.compilation.tap(id, async() => {
			const css = await compiler.$windyCSSService?.generateCSS()
			// Problem: not passing the .vue files before css is generated
			// @ts-ignore
			virtualModules.writeModule('node_modules/windi.css', css);
		});

		// Solution 2: Inject inline styles using html-webpack-plugin
		// if (HtmlWebpackPlugin.getHooks) {
		// 	compiler.hooks.compilation.tap('HtmlWebpackInjectorPlugin', (compilation) => {
		// 		HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
		// 			// @ts-ignore
		// 			'HtmlWebpackInjectorPlugin', async (data, callback) => {
		// 				// works but HMR is broken &
		// 				const css = await compiler.$windyCSSService?.generateCSS()
		// 				data.html += '<style>' + css + '</style>'
		//
		// 				callback(null, data)
		// 			}
		// 		)
		// 	});
		// }

		// Make windy service available to the loader
		let watching = false;

		const safeStartService = async () => {
			if (!compiler.$windyCSSService) {
				compiler.$windyCSSService = createUtils({
					...this.options,
					_pluginName: id,
					_projectRoot: compiler.context,
				})
				compiler.$windyCSSService.init()
			}
		};

		compiler.hooks.thisCompilation.tap('windycss', compilation => {
			compilation.hooks.childCompiler.tap('windycss', childCompiler => {
				childCompiler.$windyCSSService = compiler.$windyCSSService;
			});
		});

		compiler.hooks.run.tapPromise('windycss', async () => {
			await safeStartService();
		});

		compiler.hooks.watchRun.tapPromise('windycss', async () => {
			watching = true;
			await safeStartService();
		});

		compiler.hooks.done.tap('windycss', () => {
			if (!watching && compiler.$windyCSSService) {
				compiler.$windyCSSService = undefined;
			}
		});
	}
}

export default WindiCSSWebpackPlugin;
