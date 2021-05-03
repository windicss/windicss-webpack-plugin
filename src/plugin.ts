import {createUtils, defaultConfigureFiles} from '@windicss/plugin-utils'
import {resolve,join} from 'upath'
import {existsSync} from 'fs'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import {Compiler, Options} from './interfaces'
import {MODULE_ID,MODULE_ID_VIRTUAL, NAME} from './constants'
import debug from './debug'

const loadersPath = resolve(__dirname, 'loaders')
const transformCSSLoader = resolve(loadersPath, 'transform-css.js')
const transformTemplateLoader = resolve(loadersPath, 'transform-template.js')
const virtualModuleLoader = resolve(loadersPath, 'virtual-module.js')

class WindiCSSWebpackPlugin {
  options

  constructor(options: Options = {}) {
    // @todo validate options
    this.options = {
      transformCSS: true,
      transformGroups: true,
      ...options,
    } as Options
  }

  apply(compiler: Compiler): void {
    const root = this.options.root ?? compiler.options.resolve?.alias?.['~'] ?? compiler.context
    // Fix possibly undefined issues
    if (!compiler.options.module || !compiler.options.module.rules) {
      return
    }

    if (!compiler.options.resolve) {
      compiler.options.resolve = {}
    }

    const virtualModulePath = resolve(join(root, MODULE_ID_VIRTUAL))

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      [MODULE_ID]: virtualModulePath,
    }

    debug.plugin('options', this.options)
    /*
     * Transform groups within all detect targets.
     *
     * e.g. hover:(bg-teal-900 rounded-full) -> hover:bg-teal-900 hover:rounded-full
     */
    compiler.options.module.rules.push({
      include(resource) {
        debug.plugin('transformGroups', resource, Boolean(compiler.$windyCSSService?.isDetectTarget(resource)))
        return Boolean(compiler.$windyCSSService?.isDetectTarget(resource))
      },
      use: [{loader: transformTemplateLoader}],
    })

    /*
     * Virtual module loader
     */
    compiler.options.module.rules.push({
      include(resource) {
        return resource.endsWith(MODULE_ID_VIRTUAL)
      },
      use: [{
        ident: `${NAME}:entry`,
        loader: virtualModuleLoader
      }],
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
          // Exclude virtual module
          if (resource.endsWith(MODULE_ID_VIRTUAL) || compiler.$windyCSSService?.isExcluded(resource)) {
            return false
          }

          return Boolean(compiler.$windyCSSService?.isCssTransformTarget(resource))
        },
        use: [{
          ident: `${NAME}:css`,
          loader: transformCSSLoader
        }],
      })
    } else {
      switch (transformCSS) {
        case 'auto':
          compiler.options.module.rules.push({
            enforce: 'pre',
            include(resource) {
              if (compiler.$windyCSSService?.isExcluded(resource) || resource.endsWith(MODULE_ID_VIRTUAL)) {
                return false
              }

              return Boolean(resource.match(/\.(?:postcss|scss|css)(?:$|\?)/i))
            },
            use: [{
              ident: `${NAME}:css:pre`,
              loader: transformCSSLoader
            }],
          })
          compiler.options.module.rules.push({
            include(resource) {
              if (compiler.$windyCSSService?.isExcluded(resource) || resource.endsWith(MODULE_ID_VIRTUAL)) {
                return false
              }

              return Boolean(resource.match(/\.(?:sass|stylus|less)(?:$|\?)/i))
            },
            use: [{
              ident: `${NAME}:css`,
              loader: transformCSSLoader
            }],
          })
          break
        case 'pre':
        case 'post':
          compiler.options.module.rules.push({
            enforce: transformCSS,
            include(resource) {
              return Boolean(compiler.$windyCSSService?.isCssTransformTarget(resource)) && !resource.endsWith(MODULE_ID_VIRTUAL)
            },
            use: [{
              ident: `${NAME}:css`,
              loader: transformCSSLoader
            }],
          })
          break
      }
    }

    /*
    * Add the windycss config file as a dependency so that the watcher can handle updates to it.
    */
    compiler.hooks.afterCompile.tap(NAME, compilation => {
      if (compiler.$windyCSSService) {
        let hasConfig = false
        // add watcher for the config path
        for (const name of defaultConfigureFiles) {
          const tryPath = resolve(root, name)
          if (existsSync(tryPath)) {
            debug.plugin('config dependency at', tryPath)
            compilation.fileDependencies.add(tryPath)
            hasConfig = true
          }
        }
        // add watcher for missing dependencies
        if (!hasConfig) {
          for (const name of defaultConfigureFiles) {
            const path = resolve(root, name)
            debug.plugin('setting watcher for config creation', path)
            compilation.missingDependencies.add(path)
          }
        }
      }
    })

    /*
     * Triggered when the watcher notices a file is updated. We keep track of the updated (dirty) file and
     * create an invalidated on our virtual module.
     */
    let hmrId = 0
    compiler.hooks.invalid.tap(NAME, filename => {
      // make sure service is available and file is valid
      if (!compiler.$windyCSSService || !filename || filename.endsWith(MODULE_ID_VIRTUAL)) {
        return
      }
      const skipInvalidation = !compiler.$windyCSSService.isDetectTarget(filename) && filename != compiler.$windyCSSService.configFilePath
      debug.plugin('file update', filename, 'skip:' + skipInvalidation)
      if (skipInvalidation) {
        return
      }

      // Add dirty file so the loader can process it
      compiler.$windyCSSService.dirty.add(filename)
      // Trigger a change to the virtual module
      virtualModules.writeModule(
        virtualModulePath,
        // Need to write a dynamic string which will mark the file as modified
        `/* windicss(hmr:${hmrId++}:${filename}) */`
      )
    })

    const virtualModules = new VirtualModulesPlugin({
      [virtualModulePath]: '/* windicss(boot) */',
    })
    virtualModules.apply(compiler)


    // Make windy service available to the loader
    const initWindyCSSService = async () => {
      if (!compiler.$windyCSSService) {
        compiler.$windyCSSService = Object.assign(
          createUtils(this.options, {
            root,
            name: NAME,
          }), {
            root,
            dirty: new Set<string>(),
          }
        )
        // Scans all files and builds initial css
        // wrap in a try catch
        try {
          await compiler.$windyCSSService.init()
        } catch (e) {
          compiler.$windyCSSService.initException = e
        }
      }
    }

    compiler.hooks.thisCompilation.tap(NAME, compilation => {
      if (!compiler.$windyCSSService) {
        return
      }
      // give the init exception to the compilation so that the user can see there was an issue
      if (compiler.$windyCSSService.initException) {
        compilation.errors.push(compiler.$windyCSSService.initException)
        compiler.$windyCSSService.initException = undefined
      }
      compilation.hooks.childCompiler.tap(NAME, childCompiler => {
        childCompiler.$windyCSSService = compiler.$windyCSSService
      })
    })

    compiler.hooks.beforeCompile.tapPromise(NAME, async () => {
      await initWindyCSSService()
    })

    compiler.hooks.watchRun.tapPromise(NAME, async () => {
      await initWindyCSSService()
    })
  }
}

export default WindiCSSWebpackPlugin
