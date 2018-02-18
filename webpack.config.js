const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
     app:  './assets/js/app.js',
     guest: './assets/js/guest.js'
    },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new UglifyJsPlugin({
        test: /\.js($|\?)/i
    })
  ]
};
