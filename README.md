<h1 align='center'>windicss-webpack-plugin</h1>

<p align='center'>:leaves: <a href="https://github.com/voorjaar/windicss">Windi CSS</a> for webpack️<br>
<sup><em>Next generation utility-first CSS framework.</em></sup>
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/windicss-webpack-plugin'>
<img src='https://img.shields.io/npm/v/windicss-webpack-plugin?color=0EA5E9&label='>
</a>
</p>

## Features

- 🧩 On-demand CSS utilities (Compatible with Tailwind CSS v2)
- 📦 On-demand native elements style reseting
- 🔥 Hot module replacement (HMR)
- 🍃 Load configurations from `tailwind.config.js`
- 🤝 Framework-agnostic - Vue, React, Svelte and Angular!
- 📄 CSS `@apply` / `@screen` directives transforms (also works for Vue SFC's `<style>`)
- 🎳 Support Utility Groups - e.g. `bg-gray-200 hover:(bg-gray-100 text-red-300)`

## Install

```bash
yarn add windicss-webpack-plugin -D 
# npm i windicss-webpack-plugin -D
```

### webpack.config.js

If you have access to modify the webpack.config.js directly, then you can do the following.

```ts
// webpack.config.js
import WebpackWindiCSSPlugin from 'windicss-webpack-plugin'

export default {
  // ...
  plugins: [
    new WindiCSSWebpackPlugin()
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

## Configuration

See [options.ts](https://github.com/windicss/windicss-webpack-plugin/blob/main/packages/plugin-utils/src/options.ts) for configuration reference.


## Caveats

### Scoped Style

You will need to set `transformCSS: 'pre'` to get it work.

`@media` directive with scoped style can **only works** with `css` `postcss` `scss` but not `sass`, `less` nor `stylus`

## Credits

- Windy team
- [@antfu](https://github.com/antfu) Based on his Rollup / Vite implementation & his util package


## License

MIT License © 2021 [Harlan Wilton](https://github.com/loonpwn)

