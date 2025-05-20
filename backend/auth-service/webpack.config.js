const webpack = require('webpack');
const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    module: {
      ...options.module,
      rules: [
        ...(options.module && options.module.rules ? options.module.rules.map(rule => {
          if (rule.loader === 'ts-loader') {
            return {
              ...rule,
              options: {
                ...(rule.options || {}),
                configFile: 'tsconfig.build.json',
              },
            };
          }
          return rule;
        }) : []),
      ],
    },
    externals: [
      ...(options.externals || []),
      function ({ request }, callback) {
        if (/^cloudflare:sockets$/.test(request)) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      },
    ],
    // plugins: [
    //   ...options.plugins,
    //   new webpack.IgnorePlugin({
    //     resourceRegExp: /^cloudflare:sockets$/,
    //   }),
    // ],
    output: {
      ...(options.output || {}),
      path: path.join(__dirname, 'dist'),
      filename: 'main.js',
    },
  };
}; 