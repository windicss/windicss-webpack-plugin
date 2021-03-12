import {Compiler, Options} from './interfaces'
import {createUtils} from '@windicss/plugin-utils/dist'
import {relative, resolve} from 'path'
import {MODULE_ID_VIRTUAL, NAME} from './constants'
import {existsSync} from 'fs'
import VirtualModulesPlugin from 'webpack-virtual-modules'

class WindiCSSWebpackPlugin {
  options

  constructor(options: Options = {}) {
    // @todo validate options
    this.options = {
      transformCSS: true,
      ...options,
    } as Options
  }

  apply(compiler: Compiler): void {
    // @ts-expect-error
    const root = this.options.root ?? compiler.options.resolve.alias['~'] ?? compiler.context
    // Fix possibly undefined issues
    if (!compiler.options.module || !compiler.options.module.rules) {
      return
    }

    if (compiler.options.resolve?.alias) {
      compiler.options.resolve.alias['windi.css'] = resolve(MODULE_ID_VIRTUAL)
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
      use: [{loader: resolve(__dirname, 'loaders', 'transform-template.js')}],
    })

    /*
     * Transform css for tailwind directives.
     *
     * e.g. @apply .pt-8 pb-6; -> .pt-8 { }; .pb-6 { };
     */
    const transformCSS = this.options.transformCSS as boolean | 'pre' | 'auto' | 'post'
    if (transformCSS === true) {
      compiler.options.module.rules.push({
        include(resource) {
          const relativeResource = relative(root, resource)
          // Exclude virtual module
          if (resource.endsWith(MODULE_ID_VIRTUAL) || compiler.$windyCSSService?.isExcluded(relativeResource)) {
            return false
          }

          return Boolean(compiler.$windyCSSService?.isCssTransformTarget(relativeResource))
        },
        use: [{
          ident: `${NAME}:css`,
          loader: resolve(__dirname, 'loaders', 'transform-css.js'),
        }],
      })
    } else {
      switch (transformCSS) {
        case 'auto':
          compiler.options.module.rules.push({
            enforce: 'pre',
            include(resource) {
              const relativeResource = relative(root, resource)
              if (compiler.$windyCSSService?.isExcluded(relativeResource) || relativeResource.endsWith(MODULE_ID_VIRTUAL)) {
                return false
              }

              return Boolean(relativeResource.match(/\.(?:postcss|scss|css)(?:$|\?)/i))
            },
            use: [{
              ident: `${NAME}:css:pre`,
              loader: resolve(__dirname, 'loaders', 'transform-css.js'),
            }],
          })
          compiler.options.module.rules.push({
            include(resource) {
              const relativeResource = relative(root, resource)
              if (compiler.$windyCSSService?.isExcluded(relativeResource) || resource.endsWith(MODULE_ID_VIRTUAL)) {
                return false
              }

              return Boolean(resource.match(/\.(?:sass|stylus|less)(?:$|\?)/i))
            },
            use: [{
              ident: `${NAME}:css`,
              loader: resolve(__dirname, 'loaders', 'transform-css.js'),
            }],
          })
          break
        case 'pre':
        case 'post':
          compiler.options.module.rules.push({
            enforce: transformCSS,
            include(resource) {
              const relativeResource = relative(root, resource)
              return Boolean(compiler.$windyCSSService?.isCssTransformTarget(relativeResource)) && !resource.endsWith(MODULE_ID_VIRTUAL)
            },
            use: [{
              ident: `${NAME}:css`,
              loader: resolve(__dirname, 'loaders', 'transform-css.js'),
            }],
          })
          break
      }
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
      if (!compiler.$windyCSSService.isDetectTarget(relativeResource) && filename != compiler.$windyCSSService.configFilePath) {
        return
      }

      // Add dirty file so the loader can process it
      compiler.$windyCSSService.dirty.add(filename)
      // Trigger a change to the virtual module
      compiler.$windyCSSService.requestVirtualModuleUpdate('invalid: ' + filename)
    })

    const virtualModules = new VirtualModulesPlugin({
      [MODULE_ID_VIRTUAL]: '/* windicss */',
    })
    virtualModules.apply(compiler)

    let isWatchMode = false

    // Make windy service available to the loader
    const safeStartService = async () => {
      if (!compiler.$windyCSSService) {
        let count = 0
        const requestVirtualModuleUpdate = (id = '', css = '') => {
          virtualModules.writeModule(
            resolve(MODULE_ID_VIRTUAL),
            // Need to write a dynamic string which will mark the file as modified
            '/* windicss-hmr(' + id + '):' + String(++count) + ' */' + css,
          )
        }

        compiler.$windyCSSService = Object.assign(
          createUtils(this.options, {
            root,
            name: NAME,
          }), {
            root,
            dirty: new Set<string>(),
            requestVirtualModuleUpdate,
          }
        )
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
