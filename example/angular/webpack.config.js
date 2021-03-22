const WindiCSSWebpackPlugin = require('../../dist/index.js').default


module.exports = (config, options, targetOptions) => {

  config.devtool = 'eval-source-map'
  config.entry.styles.push('windi.css')

  // console.log(config.rules)
  // config.module.rules.push({
  //     include (file) {
  //       console.log('testing file', file)
  //       return file.indexOf('windi.css') >= 0
  //     },
  //     enforce: 'pre',
  //     test: /\.css$/,
  //     use: [
  //        require.resolve('style-loader'),
  //       {
  //         loader: require.resolve('css-loader'),
  //         options: {
  //           url: false,
  //         },
  //       },
  //     ],
  // });

  config.plugins.push(
    new WindiCSSWebpackPlugin({
      scan: {
        dirs: [ '.' ],
        exclude: [ '.next', 'node_modules' ]
      }
    })
  );

  return config;
};
