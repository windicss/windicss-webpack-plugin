import {Compiler} from './interfaces'
import {UserOptions} from '@windicss/plugin-utils'
import {relative, resolve} from 'path'
import {MODULE_ID_VIRTUAL, NAME} from "./constants";

class WindiCSSWebpackPlugin {
  options

  constructor(options: UserOptions = {}) {
    // @todo validate options
    this.options = {
      transformCSS: true,
      ...options,
    } as UserOptions
  }

  apply(compiler: Compiler): void {
    // @ts-expect-error
    const root = compiler.options.resolve.alias['~'] ?? compiler.context
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

    const webpackMeta = require(resolve(root, 'node_modules', 'webpack', 'package.json'))

    let plugin
    if (Number(webpackMeta.version.split('.')[0]) > 4) {
      plugin = require('./plugins/webpack5').default
    } else {
      plugin = require('./plugins/webpack4').default
    }

    // use webpack sensitive plugin version
    (new plugin(this.options)).apply(compiler)
  }
}

export default WindiCSSWebpackPlugin
