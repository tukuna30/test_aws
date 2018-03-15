const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
     app:  './assets/js/app.js',
     guest: './assets/js/guest.js'
  },
  plugins: [],
  output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist')
   }
};