import type webpack from 'webpack'

type LoaderTest = (l: { path: string; ident?: string }) => boolean

const windiTemplateTest: LoaderTest = l => /(\/|\\|@)windicss-template/.test(l.path)
const windiStylePitcherTest: LoaderTest = l => /(\/|\\|@)windicss-style-pitcher/.test(l.path)
const postCssLoaderTest: LoaderTest = l => /(\/|\\|@)postcss-loader/.test(l.path)
const cssLoaderTest: LoaderTest = l => /(\/|\\|@)css-loader/.test(l.path)

/*
  * Move the position of the transform-template loader for Vue SFCs.
  *
  * We move it just after the PostCSS loader
  */
export const pitch = function(this: webpack.loader.LoaderContext, remainingRequest: string) {
  const findLoaderIndex = (test: LoaderTest) => this.loaders.findIndex((loader) => {
    return test(loader) && !loader.normalExecuted
  })

  const markLoaderAsExecuted: (test: LoaderTest) => any = (test) => {
    let index, loader
    while ((index = findLoaderIndex(test)) !== -1) {
      loader = this.loaders[index]
      /*
       * Hacky solution to avoid the loader from running.
       * Previously we removed the loader entirely however, this caused
       * a conflict with other loaders (see https://github.com/windicss/windicss-webpack-plugin/issues/111).
       */
      loader.pitchExecuted = true
      loader.normalExecuted = true
    }
    return loader
  }

  // remove the pitcher immediately
  markLoaderAsExecuted(windiStylePitcherTest)

  // make sure we're dealing with style-loader
  if (!remainingRequest.includes('&type=style')) {
    // clean up
    markLoaderAsExecuted(windiTemplateTest)
    return
  }

  let newTemplateLoaderIndex = findLoaderIndex(postCssLoaderTest)
  // just in-case they don't have post-css for whatever reason we also search for the css-loader
  if (newTemplateLoaderIndex === -1)
    newTemplateLoaderIndex = findLoaderIndex(cssLoaderTest)

  // we couldn't find either PostCSS loader or CSS loader so we bail out
  if (newTemplateLoaderIndex === -1) {
    // clean up
    markLoaderAsExecuted(windiTemplateTest)
    return
  }

  const templateLoader = markLoaderAsExecuted(windiTemplateTest)
  // re-insert the template-loader in the right spot
  if (templateLoader)
    this.loaders.splice(newTemplateLoaderIndex + 1, 0, templateLoader)
}
