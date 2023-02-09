import fs, { readFileSync } from 'fs'
import type { loader } from 'webpack'
import { defaultConfigureFiles } from '@windicss/plugin-utils'
import type { LayerName } from '@windicss/plugin-utils'
import { MODULE_ID_VIRTUAL_TEST } from '../core/constants'
import debug from '../core/debug'
import { def } from '../core/utils'

async function VirtualModule(
  this: loader.LoaderContext,
  source: string,
): Promise<void> {
  const callback = this.async()!
  if (!this._compiler) {
    callback(null, source)
    return
  }
  this.cacheable(false)
  // @ts-expect-error untyped
  const service = this._compiler.$windi
  const match = this.resource.match(MODULE_ID_VIRTUAL_TEST)
  if (!service || !match) {
    const error = new Error(`Failed to match the resource "${this.resource}" to a WindiCSS virtual module.`)
    this.emitError(error)
    callback(error, source)
    return
  }

  const layer = (match[1] as LayerName | undefined) || undefined
  const isBoot = source.indexOf('(boot)') > 0

  debug.loader(`Generating "${this.resource}" using layer "${layer}${isBoot ? '" as boot ' : ' as hmr'}`)

  const generateCSS = async (layer: LayerName | undefined) => {
    try {
      // avoid duplicate scanning on HMR
      if (service.scanned && service.options.enableScan)
        service.options.enableScan = false

      const css = (await service.generateCSS(layer)).replace('(boot)', '')
      service.virtualModules.set(def(layer, 'all'), css)
      callback(null, css)
    }
    catch (e: any) {
      const error = JSON.stringify(e, null, 2)
      this.emitError(`[Windi CSS] Failed to generate CSS. Error: ${error}`)
      callback(e, `${source}\n` + `/* Error: ${error}*/`)
    }
  }

  if (isBoot) {
    await generateCSS(layer)
    return
  }

  // Make sure we're hot
  const dirtyFiles = Array.from(service.dirty)!
  if (dirtyFiles.length === 0) {
    callback(null, source)
    return
  }

  // Need to do a complete re-scan, we got a null entry on the watcher so we know a file updated but don't know which one
  if (service.dirty.has('all-modules')) {
    const contents = await Promise.all(
      [...(await service.getFiles())]
        .filter(id => service.isDetectTarget(id))
        .map(async id => [await fs.promises.readFile(id, 'utf-8'), id]),
    )

    await Promise.all(contents.map(
      async ([content, id]) => {
        if (service.isCssTransformTarget(id))
          return service.transformCSS(content, id)
        else
          return service.extractFile(content, id, true)
      },
    ))
  }
  else {
    // @ts-expect-error untyped
    const configFileUpdated = dirtyFiles.filter((id: string) => {
      return defaultConfigureFiles.filter((config) => {
        return id.endsWith(config)
      }).length > 0
    }).length > 0
    // If it is a config update we init the service again
    if (configFileUpdated) {
      service.clearCache()
      await service.init()
    }
    else {
      // Get all of our dirty files and parse their content
      const contents = await Promise.all(
        dirtyFiles.map((id) => {
          return {
            data: readFileSync(id as string, { encoding: 'utf-8' }),
            id,
          }
        }),
      )

      // Extract the content into windicss service
      for (const content of contents) {
        try {
          await service.extractFile(content.data, content.id, service.options.transformGroups)
        }
        catch (e) {
          this.emitWarning(`[Windi CSS] Failed to extract classes from resource: ${content.id}.`)
        }
      }
    }
  }
  // Don't process the same files until they're dirty again
  service.dirty.clear()

  await generateCSS(layer)
}

export default VirtualModule
