import type webpack from 'webpack'
import {NAME} from '../constants'
const isTemplateLoader = (l : { path: string }) => /(\/|\\|@)transform-template/.test(l.path)
const postCSSLoader = (l : { path: string }) => /(\/|\\|@)postcss-loader/.test(l.path)
const cssLoader = (l : { path: string }) => /(\/|\\|@)css-loader/.test(l.path)
const isPitcherLoader = (l : { ident?: string }) => `${NAME}:pitcher` === l.ident

export const pitch = function (this: webpack.loader.LoaderContext, remainingRequest: string) {
  // remove the pitcher immediately
  const pitcherLoaderIndex = this.loaders.findIndex(isPitcherLoader)
  if (pitcherLoaderIndex !== -1) {
    this.loaders.splice(pitcherLoaderIndex, 1)
  }

  /*
   * Move the position of the transform-template loader for Vue SFCs.
   *
   * We move it just after post css
   */
  if (remainingRequest.indexOf('&type=style') > 0) {
    let insertIndex = this.loaders.findIndex(postCSSLoader)
    // just in-case they don't have post-css for whatever reason we also search for the css-loader
    if (insertIndex === -1) {
      insertIndex = this.loaders.findIndex(cssLoader)
    }
    // insert in our loader at the right spot
    if (insertIndex !== -1) {
      // remove all instances of the template-loader
      let templateLoaderIndex, templateLoader
      while ((templateLoaderIndex = this.loaders.findIndex(isTemplateLoader)) !== -1) {
        templateLoader = this.loaders[templateLoaderIndex]
        this.loaders.splice(templateLoaderIndex, 1)
      }
      // re-insert the template-loader in the right spot
      if (templateLoader) {
        this.loaders.splice(insertIndex + 1, 0, templateLoader)
      }
    }
  }
}
