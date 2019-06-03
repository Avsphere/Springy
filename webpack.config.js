const path = require('path');
const webpack = require('webpack');
let basePath = '/';
module.exports = env => {
  return {
    /* no conflict is because while these look like duplicate imports they will be pulled into commons.bundle.js */
    entry: [ path.join(__dirname, 'node_modules/@babel/polyfill'), path.join(__dirname, 'src/main.js') ],
    mode: env.NODE_ENV === 'production' ? 'production' : 'development',
    output: {
      path: path.resolve(__dirname, 'public/js'),
      filename: "./main.bundle.js"
    },
    devtool: env.NODE_ENV === 'production' ? false : 'source-map',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        BASEPATH : JSON.stringify(basePath),
        NODE_ENV : JSON.stringify(env.NODE_ENV),
      })
    ]
}
}
