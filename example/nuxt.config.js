import {  WindiCSSWebpackPlugin  } from '../dist'

module.exports = {
	plugins: [
		'@/plugins/windicss'
	],
	build: {
		plugins: [
			new WindiCSSWebpackPlugin()
		],
		extend(config) {
			config.resolveLoader.alias = {
				...config.resolveLoader.alias,
				'windicss-loader': require.resolve('../dist'),
			},
			// console.log('extend build', config)
			config.module.rules.push({
				test: /\.vue$/,
				enforce: 'pre',
				loader: 'windicss-loader',
			})
		}
	}
}
