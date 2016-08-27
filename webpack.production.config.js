var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index',
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json'],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  plugins: [
    new ExtractTextPlugin('style.css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    })
  ],
  exclude: [
    'node_modules',
    path.resolve(__dirname, "./node_modules")
  ],
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src')
      },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass?sourceMap!toolbox')
      },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.svg$/, loader: 'svg-loader?pngScale=2' }
    ]
  },
  postcss: [autoprefixer]
};
