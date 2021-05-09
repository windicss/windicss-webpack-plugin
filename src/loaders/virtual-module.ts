import type webpack from 'webpack'
import {readFileSync} from 'fs'
import type {Compiler} from '../interfaces'
import {defaultConfigureFiles} from '@windicss/plugin-utils'

async function VirtualModule(
  this: webpack.loader.LoaderContext,
  source: string,
): Promise<void> {
  const callback = this.async()!
  if (!this._compiler) {
    callback(null, source)
    return
  }

  const service = (this._compiler as Compiler).$windyCSSService
  if (!service) {
    callback(null, source)
    return
  }

  const isBoot = source.indexOf('(boot)') > 0
  const generateCSS = async () => {
    try {
      let css = await service.generateCSS()

      // const sortedGeneratedClasses = Array.from(service.classesGenerated).sort(function(a, b) {
      //   return b.length - a.length;
      // });
      //
      // sortedGeneratedClasses.forEach(c => {
      //   if (c.indexOf(':') !== -1) {
      //     const mapped = crypto.createHash('md5').update(c).digest('hex').slice(0, 3);
      //     css = css.replace(c, mapped)
      //     css = css.replace(c.replace(':', '\\:'), mapped)
      //   }
      // })
      // sortedGeneratedClasses.forEach(c => {
      //   if (c.indexOf(':') === -1) {
      //     const mapped = crypto.createHash('md5').update(c).digest('hex').slice(0, 3);
      //     css = css.replace(c, mapped)
      //   }
      // })
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
    return defaultConfigureFiles.filter(config => {
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
      // add file as a dependency to invalidate hmr caches
      this.addDependency(content.id)
      try {
        service.extractFile(content.data, content.id, service.options.transformGroups)
      } catch (e) {
        this.emitWarning(`[Windi CSS] Failed to extract classes from resource: ${content.id}.`)
      }
    }
  }

  // Don't process the same files until they're dirty again
  service.dirty.clear()

  await generateCSS()
}

export default VirtualModule
