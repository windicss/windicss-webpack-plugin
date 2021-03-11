import type webpack from "webpack";
import {resolve} from "path";
const loaderUtils = require('loader-utils')
const qs = require('querystring')
const isPitcher = (l : any) => l.path !== __filename
// const isCSSLoader = (l : any) => /(\/|\\|@)css-loader/.test(l.path)
const windicssPostLoader =  resolve(__dirname, 'style-pitcher.js')

export default (code : string) => {
  console.log('code', code)
  return code
}
//
function PitchLoader(this: webpack.loader.LoaderContext) {
  //const options = loaderUtils.getOptions(this)
  const query = qs.parse(this.resourceQuery.slice(1))

  console.log('pitch', this.resource)
  console.log()

  let loaders = this.loaders

  // remove self
  loaders = loaders.filter(isPitcher)

  const genRequest = (loaders : any) => {
    // Important: dedupe since both the original rule
    // and the cloned rule would match a source import request.
    // also make sure to dedupe based on loader path.
    // assumes you'd probably never want to apply the same loader on the same
    // file twice.
    // Exception: in Vue CLI we do need two instances of postcss-loader
    // for user config and inline minification. So we need to dedupe baesd on
    // path AND query to be safe.
    const seen = new Map()
    const loaderStrings : string[] = []

    loaders.forEach((loader : any) => {
      const identifier = typeof loader === 'string'
        ? loader
        : (loader.path + loader.query)
      const request = typeof loader === 'string' ? loader : loader.request
      if (!seen.has(identifier)) {
        seen.set(identifier, true)
        // loader.request contains both the resolved loader path and its options
        // query (e.g. ??ref-0)
        loaderStrings.push(request)
      }
    })

    return loaderUtils.stringifyRequest(this, '-!' + [
      ...loaderStrings,
      this.resourcePath + this.resourceQuery
    ].join('!'))
  }

  let request = genRequest(loaders)
  const primaryLoaderIndex = loaders.findIndex(
    (l : any) => new RegExp('(\/|\\|@)' + query.lang + '-loader').test(l.path)
  )

  switch (query.lang) {
    case 'postcss':
    case 'scss':
    case 'css':
      // needs to come directly before the primary loader
      request = genRequest([
        ...loaders.slice(0, primaryLoaderIndex + 2),
        windicssPostLoader,
        ...loaders.slice(primaryLoaderIndex + 2)
      ])
      break;
    case 'sass':
    case 'stylus':
    case 'less':
      // needs to come directly after the primary loader
      request = genRequest([
        ...loaders.slice(0, primaryLoaderIndex),
        windicssPostLoader,
        ...loaders.slice(primaryLoaderIndex)
      ])
      break;
  }
  console.log('new request', request)
  console.log()
  return query.module
    ? `export { default } from  ${request}; export * from ${request}`
    : `export * from ${request}`
}

export const pitch = PitchLoader
