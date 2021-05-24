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
import WindiCSS from 'windicss-webpack-plugin'

export default {
  // ...
  plugins: [
    new WindiCSS
  ],
};
```

```ts
// main.js
import 'windi.css'
```

## New Features in v3.0

### [Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode)
```ts
// windi.config.ts
import { defineConfig } from 'windicss-webpack-plugin'

Enabled it by

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
  attributify: true
}
```

And use them as you would like:

```html
<button 
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

## Documentation

Read the [documentation](https://windicss.org/integrations/webpack.html) for more details.


## License

MIT License © 2021 [Harlan Wilton](https://github.com/harlan-zw)
