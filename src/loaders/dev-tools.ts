import { readFileSync } from 'node:fs'
import { resolve } from 'pathe'
import type { Compiler, loader } from 'webpack'
import { isDev, isWebCompilerTarget } from '../core/utils'
import { DEVTOOLS_POST_PATH } from '../core/constants'

const DEVTOOLS_CLIENT_PATH = resolve(__dirname, '../runtime/client.cjs')

function getMockClassesInjector(compiler: Compiler) {
  const completions = compiler.$windi.getCompletions()
  const comment = '/* Windi CSS mock class names for devtools auto-completion */\n'
  const css = [
    ...completions.color,
    ...completions.static,
  ].map((name: string) => `.${compiler.$windi.processor.e(name)}{}`).join('')
  return `
const style = document.createElement('style')
style.setAttribute('type', 'text/css')
style.innerHTML = ${JSON.stringify(comment + css)}
document.head.prepend(style)
`
}
async function devtoolsLoader(this: loader.LoaderContext, source: string): Promise<void> {
  const callback = this.async()!

  if (!this._compiler) {
    callback(null, source)
    return
  }

  this.cacheable(true)

  const { port, host } = await this._compiler.$windi.server.ensureStart()

  if (isWebCompilerTarget(this._compiler.options.target) && isDev()) {
    const clientContent = readFileSync(DEVTOOLS_CLIENT_PATH, 'utf-8')
      .replace('__POST_PATH__', `http://${host}:${port}${DEVTOOLS_POST_PATH}`)

    const mockClasses = getMockClassesInjector(this._compiler)

    callback(null, `${clientContent}\n${mockClasses}`)
  }
  else {
    // returns the empty string if it is not in dev environment or if the compile target is not web, e.g. SSR.
    callback(null, '')
  }
}

export default devtoolsLoader
