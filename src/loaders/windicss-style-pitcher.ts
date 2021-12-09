import type webpack from 'webpack'

type LoaderTest = (l: { path: string, ident?: string }) => boolean

const templatePitcherTest : LoaderTest = l => /(\/|\\|@)windicss-template/.test(l.path)
const windiPitcherTest : LoaderTest = l => /(\/|\\|@)windicss-style-pitcher/.test(l.path)
const postCssLoaderTest : LoaderTest = l => /(\/|\\|@)postcss-loader/.test(l.path)
const cssLoaderTest : LoaderTest = l => /(\/|\\|@)css-loader/.test(l.path)

/*
  * Move the position of the transform-template loader for Vue SFCs.
  *
  * We move it just after the PostCSS loader
  */
export const pitch = function(this: webpack.loader.LoaderContext, remainingRequest: string) {

  const findLoaderIndex = (test: LoaderTest) => this.loaders.findIndex(test)
  /**
   * Removes a loader recursively from the request and returns a found instance
   * @param test
   */
  const removeLoader : (test: LoaderTest) => any = (test) => {
    let index, loader
    while ((index = findLoaderIndex(test)) !== -1) {
      loader = this.loaders[index]
      this.loaders.splice(index, 1)
    }
    return loader
  }

  // remove the pitcher immediately
  removeLoader(windiPitcherTest)

  // make sure we're dealing with style-loader
  if (!remainingRequest.includes('&type=style')) {
    // clean up
    removeLoader(templatePitcherTest)
    return
  }


  let newTemplateLoaderIndex = findLoaderIndex(postCssLoaderTest)
  // just in-case they don't have post-css for whatever reason we also search for the css-loader
  if (newTemplateLoaderIndex === -1)
    newTemplateLoaderIndex = findLoaderIndex(cssLoaderTest)

  // we couldn't find either PostCSS loader or CSS loader so we bail out
  if (newTemplateLoaderIndex === -1) {
    // clean up
    removeLoader(templatePitcherTest)
    return
  }

  const templateLoader = removeLoader(templatePitcherTest)
  // re-insert the template-loader in the right spot
  if (templateLoader)
    this.loaders.splice(newTemplateLoaderIndex + 1, 0, templateLoader)
}
