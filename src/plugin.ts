import { existsSync } from 'fs'
import { createUtils, defaultConfigureFiles, LayerName } from '@windicss/plugin-utils'
import { resolve, join } from 'upath'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import { Compiler, Options } from './interfaces'
import { MODULE_ID, MODULE_ID_VIRTUAL_TEST, MODULE_ID_VIRTUAL_MODULES, NAME } from './constants'
import debug from './debug'

const loadersPath = resolve(__dirname, 'loaders')
const pitcher = resolve(loadersPath, 'pitcher.js')
const transformCSSLoader = resolve(loadersPath, 'transform-css.js')
const transformTemplateLoader = resolve(loadersPath, 'transform-template.js')
const virtualModuleLoader = resolve(loadersPath, 'virtual-module.js')

class WindiCSSWebpackPlugin {
  options

  constructor(options: Options = {}) {
    // @todo validate options
    this.options = {
      // default options
      ...{
        // default virtual module path will be the root
        virtualModulePath: '',
      },
      ...options,
    } as Options
  }

  apply(compiler: Compiler): void {
    const root = this.options.root ?? compiler.options.resolve?.alias?.['~'] ?? compiler.context
    // Fix possibly undefined issues
    if (!compiler.options.module || !compiler.options.module.rules)
      return

    if (!compiler.options.resolve)
      compiler.options.resolve = {}

    // setup alias
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      // add windi.css alias
      [join(this.options.virtualModulePath, MODULE_ID)]: resolve(compiler.context, MODULE_ID_VIRTUAL_MODULES[0]),
      // add virtual:windi-$layer aliases
      ...MODULE_ID_VIRTUAL_MODULES.reduce((map, key) => {
        // @ts-ignore
        map[join(this.options.virtualModulePath, key)] = resolve(compiler.context, key)
        return map
      }, {}),
      // add `windi-$layer` aliases
      ...MODULE_ID_VIRTUAL_MODULES.reduce((map, key) => {
        // @ts-ignore
        map[join(this.options.virtualModulePath, key.replace('virtual:', ''))] = resolve(compiler.context, key)
        return map
      }, {}),
    }

    debug.plugin('options', this.options)

    // Replace the css-loader with one that uses importLoaders, see https://webpack.js.org/loaders/css-loader/#importloaders
    // Note: This is experimental and may break something
    compiler.options.module.rules = compiler.options.module.rules.map((rule) => {
      if (!rule.use || !(rule.use instanceof Array))
        return rule

      rule.use = rule.use.map((use) => {
        if (use === 'css-loader') {
          return {
            loader: 'css-loader',
            options: {
              // postcss & windi
              importLoaders: 2,
            },
          }
        }
        return use
      })
      return rule
    })

    const shouldExcludeResource = (resource: string) =>
      // can't contain the windi virtual module names
      MODULE_ID_VIRTUAL_TEST.test(resource)
    /*
     * Pitch the loaders so we run transformations at the right time
     */
    compiler.options.module.rules.push({
      include(resource) {
        if (shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windyCSSService?.isDetectTarget(resource))
      },
      enforce: 'post',
      use: [{
        ident: `${NAME}:pitcher`,
        loader: pitcher,
      }],
    })

    /*
     * Transform groups within all detect targets.
     *
     * e.g. hover:(bg-teal-900 rounded-full) -> hover:bg-teal-900 hover:rounded-full
     */
    compiler.options.module.rules.push({
      include(resource) {
        if (shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windyCSSService?.isDetectTarget(resource))
      },
      use: [{
        ident: `${NAME}:template`,
        loader: transformTemplateLoader,
      }],
    })

    compiler.options.module.rules.push({
      include(resource) {
        if (shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windyCSSService?.isCssTransformTarget(resource))
      },
      use: [{
        ident: `${NAME}:css`,
        loader: transformCSSLoader,
      }],
    })

    /*
     * Virtual module loader
     */
    compiler.options.module.rules.push({
      include(resource) {
        return MODULE_ID_VIRTUAL_TEST.test(resource)
      },
      enforce: 'pre',
      use: [{
        ident: `${NAME}:entry`,
        loader: virtualModuleLoader,
      }],
    })

    /*
    * Add the windycss config file as a dependency so that the watcher can handle updates to it.
    */
    compiler.hooks.afterCompile.tap(NAME, (compilation) => {
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

    const virtualModules = new VirtualModulesPlugin(
      MODULE_ID_VIRTUAL_MODULES.reduce((map, key) => {
        // @ts-ignore
        map[join(this.options.virtualModulePath, key)] = `/* ${key}(boot) */`
        return map
      }, {}),
    )
    virtualModules.apply(compiler)

    /*
    * Triggered when the watcher notices a file is updated. We keep track of the updated (dirty) file and
    * create an invalidated on our virtual module.
    */
    let hmrId = 0
    compiler.hooks.invalid.tap(NAME, (resource) => {
      if (!resource)
        resource = 'all-modules'

      // make sure service is available and file is valid
      if (!compiler.$windyCSSService || shouldExcludeResource(resource))
        return

      const skipInvalidation
        = compiler.$windyCSSService.dirty.has(resource)
        || (resource !== 'all-modules' && !compiler.$windyCSSService.isDetectTarget(resource) && resource !== compiler.$windyCSSService.configFilePath)

      debug.plugin('file update', resource, `skip:${skipInvalidation}`)
      if (skipInvalidation)
        return
      // Add dirty file so the loader can process it
      compiler.$windyCSSService.dirty.add(resource)
      // Trigger a change to the virtual module
      const moduleUpdateId = hmrId++
      MODULE_ID_VIRTUAL_MODULES.forEach((virtualModulePath) => {
        let virtualModuleContent = ''
        const match = virtualModulePath.match(MODULE_ID_VIRTUAL_TEST)
        if (match) {
          const layer = (match[1] as LayerName | 'all') || 'all'
          if (compiler.$windyCSSService && compiler.$windyCSSService.virtualModules.has(layer))
            virtualModuleContent = compiler.$windyCSSService.virtualModules.get(layer) ?? ''
        }
        virtualModules.writeModule(
          join(this.options.virtualModulePath, virtualModulePath),
          // Need to write a dynamic string which will mark the file as modified
          `/* windicss(hmr:${moduleUpdateId}:${resource}) */\n${virtualModuleContent}`,
        )
      })
    })

    // Make windy service available to the loader
    const initWindyCSSService = async() => {
      if (!compiler.$windyCSSService) {
        const utils = this.options.utils ?? createUtils(this.options, {
          root,
          name: NAME,
        })

        compiler.$windyCSSService = Object.assign(
          utils,
          {
            root,
            virtualModules: new Map<string, string>(),
            dirty: new Set<string>(),
          },
        )
        // Scans all files and builds initial css
        // wrap in a try catch
        try {
          await compiler.$windyCSSService.init()
        }
        catch (e) {
          compiler.$windyCSSService.initException = e
        }
      }
    }

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      if (!compiler.$windyCSSService)
        return

      // give the init exception to the compilation so that the user can see there was an issue
      if (compiler.$windyCSSService.initException) {
        compilation.errors.push(compiler.$windyCSSService.initException)
        compiler.$windyCSSService.initException = undefined
      }
      compilation.hooks.childCompiler.tap(NAME, (childCompiler) => {
        childCompiler.$windyCSSService = compiler.$windyCSSService
      })
    })

    compiler.hooks.beforeCompile.tapPromise(NAME, async() => {
      await initWindyCSSService()
    })

    compiler.hooks.watchRun.tapPromise(NAME, async() => {
      await initWindyCSSService()
    })
  }
}

export default WindiCSSWebpackPlugin
