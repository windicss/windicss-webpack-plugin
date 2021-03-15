import type webpack from 'webpack'
import {readFileSync} from 'fs'
import type {Compiler} from '../interfaces'
import {configureFiles} from '@windicss/plugin-utils'

async function VirtualModule(
  this: webpack.loader.LoaderContext,
  source: string,
): Promise<void> {
  const callback = this.async()!

  const service = (this._compiler as Compiler).$windyCSSService
  if (!service) {
    callback(null, source)
    return
  }

  const isBoot = source.indexOf('(boot)') > 0
  const generateCSS = async () => {
    try {
      const css = await service.generateCSS()
      callback(null, source + '\n' + css)
    } catch (e) {
      callback(e, source + '\n' + `/* Error: ${JSON.stringify(e, null, 2)}*/`)
    }
  }

  if (isBoot) {
    await generateCSS()
    return
  }

  // Make sure we're hot
  const dirtyFiles = Array.from(service.dirty)!
  if (dirtyFiles.length === 0) {
    callback(null, source)
    return
  }

  const configFileUpdated = dirtyFiles.filter(id => {
    return configureFiles.filter(config => {
      return id.endsWith(config)
    }).length > 0
  }).length > 0
  // If it is a config update we init the service again
  if (configFileUpdated) {
    service.clearCache()
    service.init()
  } else {
    // Get all of our dirty files and parse their content
    const contents = await Promise.all(
      dirtyFiles.map(id => {
        return {
          data: readFileSync(id, {encoding: 'utf-8'}),
          id,
        }
      }),
    )

    // Extract the content into windicss service
    for (const content of contents) {
      service.extractFile(content.data, content.id, service.options.transformGroups)
    }
  }

  // Don't process the same files until they're dirty again
  service.dirty.clear()

  await generateCSS()
}

export default VirtualModule
