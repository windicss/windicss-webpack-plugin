import type { LayerName } from '@windicss/plugin-utils'
import { createUtils } from '@windicss/plugin-utils'
import { join, resolve } from 'pathe'
import VirtualModulesPlugin from 'webpack-virtual-modules'
import type { Compiler, WindiCSSWebpackPluginOptions } from './types'
import { DEVTOOLS_MODULE_ID, DEVTOOLS_VIRTUAL_MODULE, DEVTOOLS_VIRTUAL_MODULE_ID, MODULE_ID, MODULE_ID_VIRTUAL_MODULES, MODULE_ID_VIRTUAL_TEST, NAME } from './core/constants'
import debug from './core/debug'
import { def } from './core/utils'
import Server from './core/server'

export * from './types'

const loadersPath = resolve(__dirname, 'loaders')
const pitcher = resolve(loadersPath, 'windicss-style-pitcher.js')
const transformCSSLoader = resolve(loadersPath, 'windicss-css.js')
const transformTemplateLoader = resolve(loadersPath, 'windicss-template.js')
const virtualModuleLoader = resolve(loadersPath, 'virtual-module.js')
const devtoolsLoader = resolve(loadersPath, 'dev-tools.js')

class WindiCSSWebpackPlugin {
  options

  constructor(options: Partial<WindiCSSWebpackPluginOptions> = {}) {
    // @todo validate options
    this.options = {
      // default options
      ...{
        // default virtual module path will be the root
        virtualModulePath: '',
      },
      ...options,
    } as WindiCSSWebpackPluginOptions
  }

  apply(compiler: Compiler): void {
    // resolve the root working directory
    let root = compiler.context
    if (this.options.root)
      root = this.options.root
    else if (compiler.options.resolve && compiler.options.resolve.alias && compiler.options.resolve.alias['~'])
      root = compiler.options.resolve.alias['~']

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
      [join(this.options.virtualModulePath, DEVTOOLS_MODULE_ID)]: resolve(compiler.context, DEVTOOLS_VIRTUAL_MODULE),
      [join(this.options.virtualModulePath, DEVTOOLS_VIRTUAL_MODULE_ID)]: resolve(compiler.context, DEVTOOLS_VIRTUAL_MODULE),
      // add virtual:windi-$layer aliases
      ...MODULE_ID_VIRTUAL_MODULES.reduce((map, key) => {
        // @ts-expect-error untyped
        map[join(this.options.virtualModulePath, key)] = resolve(compiler.context, key)
        return map
      }, {}),
      // add `windi-$layer` aliases
      ...MODULE_ID_VIRTUAL_MODULES.reduce((map, key) => {
        // @ts-expect-error untyped
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
        if (!compiler.$windi || shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windi.isDetectTarget(resource))
      },
      // only styles
      resourceQuery: /type=style/,
      enforce: 'post',
      use: [{
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
        if (!compiler.$windi || shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windi.isDetectTarget(resource))
      },
      use: [{
        loader: transformTemplateLoader,
      }],
    })

    compiler.options.module.rules.push({
      include(resource) {
        if (!compiler.$windi || shouldExcludeResource(resource))
          return false

        return Boolean(compiler.$windi.isCssTransformTarget(resource))
      },
      use: [{
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
        loader: virtualModuleLoader,
      }],
    })

    /*
    * Devtools loader
    */
    compiler.options.module.rules.push({
      include(resource) {
        return resource.includes(DEVTOOLS_VIRTUAL_MODULE)
      },
      enforce: 'pre',
      use: [{
        loader: devtoolsLoader,
      }],
    })

    /*
    * Add the windycss config file as a dependency so that the watcher can handle updates to it.
    */
    compiler.hooks.afterCompile.tap(NAME, (compilation) => {
      if (!compiler.$windi)
        return

      if (compiler.$windi.configFilePath) {
        const configFilePath = resolve(compiler.$windi.configFilePath)
        debug.plugin('config dependency at', configFilePath)
        compilation.fileDependencies.add(configFilePath)
      }
      else {
        // add watcher for missing dependencies
        for (const name of ['windi.config.ts', 'windi.config.js']) {
          const path = resolve(root, name)
          debug.plugin('setting watcher for config creation', path)
          compilation.missingDependencies.add(path)
        }
      }
    })

    const virtualModules = new VirtualModulesPlugin(
      [...MODULE_ID_VIRTUAL_MODULES, DEVTOOLS_VIRTUAL_MODULE].reduce((map, key) => {
        // @ts-expect-error untyped
        map[join(this.options.virtualModulePath, key)] = `/* ${key}(boot) */`
        return map
      }, {}),
    )
    virtualModules.apply(compiler)

    let hmrId = 0
    // invalidate virtual css modules
    const invalidateCssModules = (resource: string, modules: string[]) => {
      // Trigger a change to the virtual module
      const moduleUpdateId = hmrId++
      modules.forEach((virtualModulePath) => {
        let virtualModuleContent = ''
        const match = virtualModulePath.match(MODULE_ID_VIRTUAL_TEST)
        if (match) {
          const layer = (match[1] as LayerName | 'all') || 'all'
          if (compiler.$windi && compiler.$windi.virtualModules.has(layer))
            virtualModuleContent = def(compiler.$windi.virtualModules.get(layer), '')
        }
        virtualModules.writeModule(
          join(this.options.virtualModulePath, virtualModulePath),
          // Need to write a dynamic string which will mark the file as modified
          `/* windicss(hmr:${moduleUpdateId}:${resource}) */\n${virtualModuleContent}`,
        )
      })
    }

    /*
    * Triggered when the watcher notices a file is updated. We keep track of the updated (dirty) file and
    * create an invalidated on our virtual module.
    */
    compiler.hooks.invalid.tap(NAME, (resource) => {
      if (!resource)
        resource = 'all-modules'

      // make sure service is available and file is valid
      if (!compiler.$windi || shouldExcludeResource(resource))
        return

      const skipInvalidation
        = compiler.$windi.dirty.has(resource)
        || (resource !== 'all-modules' && !compiler.$windi.isDetectTarget(resource) && resource !== compiler.$windi.configFilePath)

      debug.plugin('file update', resource, `skip:${skipInvalidation}`)
      if (skipInvalidation)
        return
      // Add dirty file so the loader can process it
      compiler.$windi.dirty.add(resource)
      invalidateCssModules(resource, MODULE_ID_VIRTUAL_MODULES)
    })

    // Make windy service available to the loader
    const initWindyCSSService = async() => {
      if (!compiler.$windi) {
        const utils = def(this.options.utils, createUtils(this.options, {
          root,
          name: NAME,
        }))

        compiler.$windi = Object.assign(
          utils,
          {
            root,
            virtualModules: new Map<string, string>(),
            dirty: new Set<string>(),
            invalidateCssModules,
            server: new Server(compiler, this.options.server),
          },
        )
        // Scans all files and builds initial css
        // wrap in a try catch
        try {
          await compiler.$windi.init()
        }
        catch (e: any) {
          compiler.$windi.initException = e
        }
      }
    }

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      if (!compiler.$windi)
        return

      // give the init exception to the compilation so that the user can see there was an issue
      if (compiler.$windi.initException) {
        compilation.errors.push(compiler.$windi.initException)
        compiler.$windi.initException = undefined
      }
      compilation.hooks.childCompiler.tap(NAME, (childCompiler) => {
        childCompiler.$windi = compiler.$windi
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
