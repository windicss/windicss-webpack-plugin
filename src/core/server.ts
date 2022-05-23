import http from 'http'
import { resolve } from 'path'
import type { IncomingMessage } from 'http'
import type { Options } from 'get-port'
import type { Compiler, WindiCSSWebpackPluginOptions } from '../types'
import { DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT, DEVTOOLS_POST_PATH, DEVTOOLS_VIRTUAL_MODULE } from './constants'
import { getChangedModuleNames, isDev } from './utils'

const getPort = (options: Options) => import('get-port').then(({ default: getPort }) => getPort(options))

function getBodyJson(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('error', reject)
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) || {})
      }
      catch (e) {
        reject(e)
      }
    })
  })
}

function updateCSS(compiler: Compiler) {
  const names = getChangedModuleNames(compiler.$windi)

  // Use core/dev-tools-update.js to trigger regeneration of css, 'all-modules' will be slower.
  compiler.$windi.dirty.add(resolve(__dirname, './core/dev-tools-update.js'))

  compiler.$windi.invalidateCssModules(DEVTOOLS_VIRTUAL_MODULE, names)
}

export default class Server {
  server: http.Server
  host: string
  port: number
  _listen: boolean

  constructor(compiler: Compiler, options: WindiCSSWebpackPluginOptions['server']) {
    this.host = options?.host ?? DEFAULT_SERVER_HOST
    this.port = options?.port ?? DEFAULT_SERVER_PORT
    this.server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      if (req.url === DEVTOOLS_POST_PATH && req.method === 'POST') {
        try {
          const data = await getBodyJson(req)
          let changed = false
          switch (data.type) {
            case 'add-classes':
              changed = compiler.$windi.addClasses(data.data || [])
          }
          if (changed && this._listen)
            updateCSS(compiler)

          res.statusCode = 200
          res.end()
        }
        catch (err) {
          res.statusCode = 500
          res.end()
        }
      }
      else {
        res.statusCode = 200
        res.end()
      }
    })
    this._listen = false
  }

  async ensureStart() {
    if (!this._listen && isDev()) {
      this.port = await getPort({ port: this.port })
      this.server.listen(this.port, this.host, () => {
        this._listen = true
        // TODO: In webpack 5,  use compiler.hooks.shutdown instead
        process.once('exit', () => {
          this.close()
        })
      })
    }
    return this
  }

  close() {
    if (this._listen)
      this.server.close()
  }
}
