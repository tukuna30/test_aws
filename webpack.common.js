const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
     app:  './app/js/app.js',
     guest: './app/js/guest.js'
  },
  plugins: [],
  output: {
     filename: '[name].bundle.js',
     path: path.resolve(__dirname, 'dist')
   },
   module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use: [{
            loader: "style-loader" // creates style nodes from JS strings
        }, {
            loader: "css-loader" // translates CSS into CommonJS
        }, {
            loader: "sass-loader" // compiles Sass to CSS
        }]
      }
    ]
  },
  mode: 'none'
};