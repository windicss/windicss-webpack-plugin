import {Compiler} from './interfaces'
import {NAME, MODULE_ID_VIRTUAL} from './constants'
import {UserOptions, createUtils} from '@windicss/plugin-utils'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import {resolve, relative} from 'path'
import {existsSync} from 'fs'

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
    this.options.transformCSS = true
    // @ts-expect-error
    if (this.options.transformCSS) {
      compiler.options.module.rules.push({
        enforce: 'pre',
        include(resource) {
          const relativeResource = relative(root, resource)
          // Check excluded
          if (compiler.$windyCSSService?.isExcluded(relativeResource)) {
            return false
          }

          // Exclude virtual module
          if (relativeResource.endsWith(MODULE_ID_VIRTUAL)) {
            return false
          }

          return Boolean(relativeResource.match(/\.(?:postcss|scss|css|less)(?:$|\?)/i))
        },
        use: [{
          ident: `${NAME}:css:pre`,
          loader: resolve(__dirname, 'loaders', 'transform-css.js'),
        }],
      })

      compiler.options.module.rules.push({
        include(resource) {
          const relativeResource = relative(root, resource)
          // Check exluded
          if (compiler.$windyCSSService?.isExcluded(relativeResource)) {
            return false
          }

          // Exclude virtual module
          if (resource.endsWith(MODULE_ID_VIRTUAL)) {
            return false
          }

          return Boolean(resource.match(/\.(?:sass|stylus)(?:$|\?)/i))
        },
        use: [{
          ident: `${NAME}:css:post`,
          loader: resolve(__dirname, 'loaders', 'transform-css.js'),
        }],
      })
    } else if (typeof this.options.transformCSS === 'string') {
      compiler.options.module.rules.push({
        enforce: this.options.transformCSS,
        include(resource) {
          const relativeResource = relative(root, resource)
          // Exclude virtual module
          if (resource.endsWith(MODULE_ID_VIRTUAL)) {
            return false
          }

          if (compiler.$windyCSSService?.isExcluded(relativeResource)) {
            return false
          }

          return Boolean(compiler.$windyCSSService?.isCssTransformTarget(relativeResource))
        },
        use: [{
          ident: `${NAME}:css`,
          loader: resolve(__dirname, 'loaders', 'transform-css.js'),
        }],
      })
    }

    /*
     * Adds the content to our virtual module.
     */
    compiler.options.module.rules.push({
      include(resource) {
        return resource.endsWith(MODULE_ID_VIRTUAL)
      },
      use: [{
        ident: `${NAME}:entry`,
        loader: resolve(__dirname, 'loaders', 'transform-virtual-module.js'),
      }],
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
      if (!compiler.$windyCSSService || !filename) {
        return
      }

      if (filename.endsWith(MODULE_ID_VIRTUAL)) {
        return
      }

      const relativeResource = relative(root, filename)
      if (compiler.$windyCSSService.isExcluded(relativeResource) || !compiler.$windyCSSService.isDetectTarget(relativeResource)) {
        return
      }

      // Add dirty file so the loader can process it
      compiler.$windyCSSService.dirty.add(filename)
      // Trigger a change to the virtual module
      compiler.$windyCSSService.requestVirtualModuleUpdate('invalid: ' + filename)
    })

    const virtualModules = new VirtualModulesPlugin()
    // Setup plugin if they don't exist for some reason
    compiler.options.plugins?.push(virtualModules)

    let isWatchMode = false

    // Make windy service available to the loader
    const safeStartService = async () => {
      if (!compiler.$windyCSSService) {
        let count = 0
        const requestVirtualModuleUpdate = (id = '', css = '') => {
          virtualModules.writeModule(
            MODULE_ID_VIRTUAL,
            // Need to write a dynamic string which will mark the file as modified
            '/* windicss-hmr(' + id + '):' + String(++count) + ' */' + css,
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
        compiler.$windyCSSService.requestVirtualModuleUpdate('init', await compiler.$windyCSSService.generateCSS())
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
