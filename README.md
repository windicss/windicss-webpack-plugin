<h1 align="center">
<a href="https://github.com/windicss/windicss/wiki">
  <img src="https://windicss.netlify.app/assets/logo.svg" alt="Windi CSS Logo" height="120" width="120"/><br>
</a>
  webpack WindiCSS Plugin
</h1>

# webpack-windicss-plugin

> A WindiCSS plugin for webpack


## Features
- framework agnostic
- language agnostic

:warning: This package is a WIP.


## Known issues

- Vue scoped postcss is not working.

```
<style lang="postcss" scoped>
.bar {
	@apply bg-pink-400 text-white p-4 w-1/4;
}

@screen md {
	.bar {
		background: red;
	}
}
</style>
```

- Config file updates are not reflecting _new_ attributes.
- No support for compile mode

## License

[MIT](./LICENSE)
