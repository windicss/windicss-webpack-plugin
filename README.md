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

## Documentation

Read the [documentation](https://windicss.org/integrations/webpack.html) for more details.

## New Features in v3.0

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

## License

MIT License © 2021 [Harlan Wilton](https://github.com/harlan-zw)
