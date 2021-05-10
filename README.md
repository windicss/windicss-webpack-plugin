<h1 align='center'>windicss-webpack-plugin</h1>

<p align='center'>:leaves: <a href="https://github.com/voorjaar/windicss">Windi CSS</a> for webpack️<br>
<sup><em>Next generation utility-first CSS framework.</em></sup>
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/windicss-webpack-plugin'>
<img src='https://img.shields.io/npm/v/windicss-webpack-plugin?color=0EA5E9&label='>
<img src='https://github.com/windicss/windicss-webpack-plugin/actions/workflows/test.yml/badge.svg' >
</a>
</p>

## Features

- 🧩 On-demand CSS utilities (Compatible with Tailwind CSS v2)
- 📦 On-demand native elements style reseting
- 🔥 Hot module replacement (HMR)
- 🍃 Load configurations from `tailwind.config.js`
- 🤝 Framework-agnostic: Vue CLI, Nuxt, Next, UmiJS, etc!
- 📄 Use `@apply` / `@screen` directives in any file: Less, SCSS, SASS, PostCSS, Stylus
- 🎳 Support Utility Groups - e.g. `bg-gray-200 hover:(bg-gray-100 text-red-300)`

## Install

```bash
yarn add windicss-webpack-plugin -D 
# npm i windicss-webpack-plugin -D
```

### webpack.config.js

If you have access to modify the webpack.config.js directly, then you can do the following.

```js
// webpack.config.js
import WebpackWindiCSSPlugin from 'windicss-webpack-plugin'

export default {
  // ...
  plugins: [
    new WebpackWindiCSSPlugin()
  ],
};
```

```ts
// main.js
import 'windi.css'
```

### Other examples

See [./example](./example)

That's all. Build your app just like what you would do with Tailwind CSS, but much faster! ⚡️

## Migration

If you are already using Tailwind CSS for your app, please consult the [documentation](https://windicss.netlify.app/guide/migration.html) on migrating.

### All set.

That's all, fire up your app and enjoy the speed!

## TypeScript

You can use TypeScript for your config file if you're using esbuild.

Simply rename your config it to `tailwind.config.ts`.

```ts
// tailwind.config.ts
import { defineConfig } from 'windicss-webpack-plugin'

export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          100: '#096',
        },
      },
    },
  },
})
```

### Safelist

By default, we scan your source code statically and find all the usages of the utilities then generated corresponding CSS on-demand. However, there is some limitation that utilities that decided in the runtime can not be matched efficiently, for example

```tsx
<!-- will not be detected -->
<div className={`p-${size}`}>
```

For that, you will need to specify the possible combinations in the `safelist` options of `windi.config.ts`.

```ts
// windi.config.ts
import { defineConfig } from 'windicss-webpack-plugin'

export default defineConfig({
  safelist: 'p-1 p-2 p-3 p-4'
})
```

Or you can do it this way

```ts
// windi.config.ts
import { defineConfig } from 'windicss-webpack-plugin'

function range(size, startAt = 1) {
  return Array.from(Array(size).keys()).map(i => i + startAt);
}

export default defineConfig({
  safelist: [
    range(30).map(i => `p-${i}`), // p-1 to p-3
    range(10).map(i => `mt-${i}`) // mt-1 to mt-10
  ]
})
```

### Scanning

On server start, `windicss-webpack-plugin` will scan your source code and extract the utilities usages. By default,
only files under `src/` with extensions `vue, html, mdx, pug, jsx, tsx` will be included. If you want to enable scanning for other file type of locations, you can configure it via:

```ts
// windi.config.js
import { defineConfig } from 'windcss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx}'],
    exclude: ['node_modules', '.git']
  }
})
```

Or in plugin options:

```ts
// webpack.config.js
import WebpackWindiCSSPlugin from 'windicss-webpack-plugin'

export default {
  // ...
  plugins: [
    new WebpackWindiCSSPlugin({
      scan: {
        dirs: ['.'], // all files in the cwd
        fileExtensions: ['vue', 'js', 'ts'], // also enabled scanning for js/ts
      },
    })
  ],
};
```

### More

See [options.ts](https://github.com/windicss/vite-plugin-windicss/blob/main/packages/plugin-utils/src/options.ts) for more configuration reference.


## Credits

- Windy team
- [@antfu](https://github.com/antfu) Based on his Rollup / Vite implementation & his util package


## License

MIT License © 2021 [Harlan Wilton](https://github.com/harlan-zw)

