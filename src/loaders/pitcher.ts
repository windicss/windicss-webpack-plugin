import type webpack from 'webpack'
import { NAME } from '../core/constants'
const isTemplateLoader = (l: { path: string }) => /(\/|\\|@)transform-template/.test(l.path)
const postCSSLoader = (l: { path: string }) => /(\/|\\|@)postcss-loader/.test(l.path)
const cssLoader = (l: { path: string }) => /(\/|\\|@)css-loader/.test(l.path)
const isPitcherLoader = (l: { ident?: string }) => `${NAME}:pitcher` === l.ident

/*
  * Move the position of the transform-template loader for Vue SFCs.
  *
  * We move it just after the PostCSS loader
  */
export const pitch = function(this: webpack.loader.LoaderContext, remainingRequest: string) {
  // remove the pitcher immediately
  const pitcherLoaderIndex = this.loaders.findIndex(isPitcherLoader)
  if (pitcherLoaderIndex !== -1)
    this.loaders.splice(pitcherLoaderIndex, 1)

  // ignore custom block
  if (remainingRequest.includes('&type=custom'))
    return ''

  // make sure we're dealing with style-loader
  if (!remainingRequest.includes('&type=style'))
    return

  let newTemplateLoaderIndex = this.loaders.findIndex(postCSSLoader)
  // just in-case they don't have post-css for whatever reason we also search for the css-loader
  if (newTemplateLoaderIndex === -1)
    newTemplateLoaderIndex = this.loaders.findIndex(cssLoader)

  // we couldn't find either PostCSS loader or CSS loader so we bail out
  if (newTemplateLoaderIndex === -1)
    return

  // remove all instances of the template-loader
  let templateLoaderIndex, templateLoader
  while ((templateLoaderIndex = this.loaders.findIndex(isTemplateLoader)) !== -1) {
    templateLoader = this.loaders[templateLoaderIndex]
    this.loaders.splice(templateLoaderIndex, 1)
  }
  // re-insert the template-loader in the right spot
  if (templateLoader)
    this.loaders.splice(newTemplateLoaderIndex + 1, 0, templateLoader)
}
