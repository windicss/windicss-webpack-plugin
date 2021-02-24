import {Compiler} from './interfaces'
import {UserOptions, createUtils} from '@windicss/plugin-utils'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import {resolve, relative} from 'path'
import {existsSync} from 'fs'

const NAME = 'windicss-webpack-plugin'
const MODULE_ID = 'windi.css'
const MODULE_ID_VIRTUAL = `node_modules/${MODULE_ID}`

class WindiCSSWebpackPlugin {
  options

  constructor(options: UserOptions = {}) {
    // @todo validate options
    this.options = options
  }

  apply(compiler: Compiler): void {
    // @ts-expect-error
    const root = compiler.options.resolve.alias['~'] ?? compiler.context
    // Fix possibly undefined issues
    if (!compiler.options.module || !compiler.options.module.rules) {
      return
    }

    /*
     * Transform groups within all detect targets.
     *
     * e.g. hover:(bg-teal-900 rounded-full) -> hover:bg-teal-900 hover:rounded-full
     */
    compiler.options.module.rules.push({
      enforce: 'pre',
      include(resource) {
        const relativeResource = relative(root, resource)
        return Boolean(compiler.$windyCSSService?.isDetectTarget(relativeResource))
      },
      use: [{loader: resolve(__dirname, 'loaders', 'transform-groups.js')}],
    })

    /*
     * Transform css for tailwind directives.
     *
     * e.g. @apply .pt-8 pb-6; -> .pt-8 { }; .pb-6 { };
     */
    compiler.options.module.rules.push({
      enforce: 'pre',
      include(resource) {
        const relativeResource = relative(root, resource)
        const isValidCssTarget = Boolean(compiler.$windyCSSService?.isCssTransformTarget(relativeResource))
        // Exclude virtual module
        return isValidCssTarget && !resource.includes(MODULE_ID_VIRTUAL)
      },
      use: [{loader: resolve(__dirname, 'loaders', 'transform-css.js')}],
    })

    /*
     * Adds the content to our virtual module.
     */
    compiler.options.module.rules.push({
      include(resource) {
        return resource.indexOf(MODULE_ID_VIRTUAL) > 0
      },
      use: [{loader: resolve(__dirname, 'loaders', 'transform-virtual-module.js')}],
    })

    /*
     * Add the windycss config file as a dependency so that the watcher can handle updates to it.
     */
    compiler.hooks.afterCompile.tap(NAME, compilation => {
      if (compiler.$windyCSSService) {
        for (const name of [
          'windi.config.ts',
          'windi.config.js',
          'tailwind.config.ts',
          'tailwind.config.js',
        ]) {
          const tryPath = resolve(root, name)
          if (existsSync(tryPath)) {
            compilation.fileDependencies.add(tryPath)
          } else {
            compilation.missingDependencies.add(tryPath)
          }
        }
      }
    })

    /*
     * Triggered when the watcher notices a file is updated. We keep track of the updated (dirty) file and
     * create an invalidated on our virtual module.
     */
    compiler.hooks.invalid.tap(NAME, filename => {
      if (compiler.$windyCSSService) {
        // Add dirty file so the loader can proces it
        compiler.$windyCSSService.dirty.add(filename)
        // Trigger a change to the virtual module
        compiler.$windyCSSService.requestVirtualModuleUpdate('invalid: ' + filename)
      }
    })

    const virtualModules = new VirtualModulesPlugin()
    // Setup plugin if they don't exist for some reason
    compiler.options.plugins?.push(virtualModules)

    let isWatchMode = false

    // Make windy service available to the loader
    const safeStartService = async () => {
      if (!compiler.$windyCSSService) {
        let count = 0
        const requestVirtualModuleUpdate = (id = '') => {
          virtualModules.writeModule(
            MODULE_ID_VIRTUAL,
            // Need to write a dynamic string which will mark the file as modified
            '/* windicss-hmr(' + id + '):' + String(++count) + ' */',
          )
        }

        compiler.$windyCSSService = {
          ...createUtils(this.options, {
            root,
            name: NAME,
          }),
          root,
          dirty: new Set<string>(),
          requestVirtualModuleUpdate,
        }
        // Scans all files and builds initial css
        compiler.$windyCSSService.init()
        compiler.$windyCSSService.requestVirtualModuleUpdate('init')
      }
    }

    compiler.hooks.thisCompilation.tap(NAME, compilation => {
      compilation.hooks.childCompiler.tap(NAME, childCompiler => {
        childCompiler.$windyCSSService = compiler.$windyCSSService
      })
    })

    compiler.hooks.beforeCompile.tapPromise(NAME, async () => {
      await safeStartService()
    })

    compiler.hooks.watchRun.tapPromise(NAME, async () => {
      isWatchMode = true
      await safeStartService()
    })

    compiler.hooks.done.tap(NAME, () => {
      if (!isWatchMode && compiler.$windyCSSService) {
        compiler.$windyCSSService = undefined
      }
    })
  }
}

export default WindiCSSWebpackPlugin
