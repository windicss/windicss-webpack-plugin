import { Compiler } from './interfaces'
import { UserOptions, createUtils } from '@windicss/plugin-utils'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { resolve } from 'path'

const id = 'windicss-webpack-plugin'

class WindiCSSWebpackPlugin {
	options

	constructor(options : UserOptions = {}) {
		// @todo validate options
		this.options = options
	}

	apply(compiler: Compiler): void {
		// @ts-ignore
		compiler.options.entry.app.unshift(
			'./node_modules/windi.css',
		)

		// @ts-ignore
		const root = compiler.options.resolve.alias['~'] ?? compiler.context

		// @ts-ignore
		compiler.hooks.compilation.tap(id, compilation => {

			// @ts-ignore
			compilation.hooks.normalModuleLoader.tap(id, (module, loaderContext : LoaderContext) => {
				if (!compiler.$windyCSSService) {
					return
				}
				// @ts-ignore
				if (compiler.$windyCSSService.isCssTransformTarget(loaderContext.resource)) {
					loaderContext.loaders.push({
						loader: resolve(__dirname, 'transform-css-loader.js')
					})
					// @ts-ignore
				}
				if (compiler.$windyCSSService.isDetectTarget(loaderContext.resource) && loaderContext.resource.indexOf('template.html') < 0) {
					// @ts-ignore
					loaderContext.loaders.push({
						loader: resolve(__dirname, 'transform-groups-loader.js')
					})
				}
			});
		});

		// add config as a dependency
		compiler.hooks.afterCompile.tap(id, (compilation) => {
			if (compiler.$windyCSSService) {
				const config = compiler.$windyCSSService.configFilePath
				if (config && !compilation.fileDependencies.has(config)) {
					compilation.fileDependencies.add(config);
				}
			}
		})

			// Solution 1: Use a virtual module
		const virtualModules = new VirtualModulesPlugin()
		// @ts-ignore
		compiler.options.plugins.push(virtualModules)

		// Make windy service available to the loader
		let watching = false;

		const safeStartService = async () => {
			if (!compiler.$windyCSSService) {
				compiler.$windyCSSService = createUtils(this.options, {
					root,
					name: id
				})
				compiler.$windyCSSService.init()
				// @ts-ignore
				const css = await compiler.$windyCSSService.generateCSS()
				virtualModules.writeModule('node_modules/windi.css', '/* windicss */\n' + css);
			}
		};

		compiler.hooks.thisCompilation.tap(id, compilation => {
			compilation.hooks.childCompiler.tap(id, childCompiler => {
				childCompiler.$windyCSSService = compiler.$windyCSSService;
			});
		});

		compiler.hooks.beforeCompile.tapPromise(id, async () => {
			await safeStartService();
		});

		compiler.hooks.watchRun.tapPromise(id, async () => {
			watching = true;
			await safeStartService();
		});

		compiler.hooks.done.tap(id, () => {
			if (!watching && compiler.$windyCSSService) {
				compiler.$windyCSSService = undefined;
			}
		});
	}
}

export default WindiCSSWebpackPlugin;
