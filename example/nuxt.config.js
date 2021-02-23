import {  WindiCSSWebpackPlugin  } from '../dist'

module.exports = {
	css: [
		'@/assets/css/test.css'
	],
	components: true,
	build: {
		// need to fix some weird transpiling issue with the config
		babel: {
			presets({ isServer }) {
				const targets = isServer ? { node: 'current' } : { chrome: 88 }
				return [
					[require.resolve('@nuxt/babel-preset-app'), { targets, useBuiltIns: false }]
				]
			}
		},
		plugins: [
			new WindiCSSWebpackPlugin({
				scan: {
					dirs: [ './' ],
				}
			})
		],
		extend(config) {
			config.devtool = 'source-maps'
		}
	}
}
