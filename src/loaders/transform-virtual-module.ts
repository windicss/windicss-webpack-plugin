import type webpack from 'webpack';
import {readFileSync} from 'fs';
import type {Compiler} from '../interfaces';
import {relative} from 'path';

async function TransformVirtualModule(
  this: webpack.loader.LoaderContext,
  source: string,
): Promise<void> {
  const callback = this.async()!;

  const service = (this._compiler as Compiler).$windyCSSService;

  if (!service) {
    callback(null, source);
    return;
  }

  // Make sure we're hot
  if (this.hot) {
    const dirtyFiles = Array.from(service.dirty);
    const isConfig = dirtyFiles.filter(id => {
      return [
        'windi.config.ts',
        'windi.config.js',
        'tailwind.config.ts',
        'tailwind.config.js',
      ].filter(config => {
        return id.endsWith(config);
      });
    }).length;
    // If it is a config update we init the service again
    if (isConfig) {
      service.clearCache();
      service.init();
    } else {
      // Get all of our dirty files and parse their content
      const contents = await Promise.all(
        dirtyFiles
          .filter(id => service.isDetectTarget(relative(service.root, id)))
          .map(id => readFileSync(id, 'utf-8')),
      );

      // Extract the content into windi
      for (const content of contents) {
        service.extractFile(content, true);
      }
    }

    // Don't process the same files until they're dirty again
    service.dirty.clear();
  }

  const css = await service.generateCSS();

  callback(null, css);
}

export default TransformVirtualModule;
