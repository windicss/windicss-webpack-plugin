<h1 align='center'>windicss-webpack-plugin</h1>

<p align='center'>:leaves: <a href="https://github.com/windicss/windicss">Windi CSS</a> for webpack️<br>
<sup><em>Next generation utility-first CSS framework.</em></sup>
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/windicss-webpack-plugin'>
<img src='https://img.shields.io/npm/v/windicss-webpack-plugin?color=0EA5E9&label='>
</a>
<a href='https://github.com/windicss/windicss-webpack-plugin/actions/workflows/test.yml'>
<img src='https://github.com/windicss/windicss-webpack-plugin/actions/workflows/test.yml/badge.svg' >
</a>
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="2000" height="0" /><br>
<i>Status:</i> <b>Stable - v4 coming soon</b><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦</sub><br>
<img width="2000" height="0" />
</td>
</tbody>
</table>
</p>

## Features

- 🧩 On-demand CSS utilities (Compatible with Tailwind CSS v2) and preflights
- 🍃 Load configurations from `tailwind.config.js`
- 🤝 Framework-agnostic: Vue CLI, Nuxt, Next, UmiJS, etc!
- 📄 Use [directives](https://windicss.org/features/directives.html) in any CSS (SCSS, LESS, etc) `@apply`, `@variants`, `@screen`, `@layer`, `theme()`,
- 🎳 Support Utility Groups - e.g. `bg-gray-200 hover:(bg-gray-100 text-red-300)`

## Documentation

Read the [documentation](https://windicss.org/integrations/webpack.html) for more details.

## New Webpack Plugin Features

**Design in DevTools mode**

Add the import with your existing windi imports and you'll have autocompletion in your Chrome DevTools! See ["Design in DevTools"](https://windicss.org/integrations/vite.html#design-in-devtools) for
more information.

```js
import 'virtual:windi-devtools'
```

<img src="https://user-images.githubusercontent.com/41503212/163978055-9be54838-5156-47ca-a2e7-f94480806002.gif" width="300" />

Thanks [await-ovo](https://github.com/await-ovo)!

## New Windi v3.0 Features

### [Attributify Mode](https://windicss.org/posts/v30.html#attributify-mode)

Enabled it by

```ts
// windi.config.ts
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

### [Alias Config](https://windicss.org/posts/v30.html#alias-config)

```ts
// windi.config.ts
export default {
  alias: {
    'hstack': 'flex items-center',
    'vstack': 'flex flex-col',
    'icon': 'w-6 h-6 fill-current',
    'app': 'text-red',
    'app-border': 'border-gray-200 dark:border-dark-300',
  },
}
```

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.png">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.png'/>
  </a>
</p>

## License

MIT License © 2022 - Present [Harlan Wilton](https://github.com/harlan-zw)
