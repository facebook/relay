/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const DefinePlugin = require('webpack/lib/DefinePlugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

const BUILD_DIR = argv['target-dir'] || 'src';

module.exports = {
  entry: {
    graphiql: './graphiql',
    playground: './playground',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css!autoprefixer-loader?browsers=last 2 versions',
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel?stage=0',
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
      },
    ],
  },
  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty',
  },
  output: {
    path: path.resolve(__dirname, '../website', BUILD_DIR, 'relay/prototyping'),
    filename: '[name].js',
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      ),
    }),
    new HTMLWebpackPlugin({
      chunks: ['graphiql'],
      filename: 'graphiql.html',
      title: 'GraphiQL',
    }),
    new HTMLWebpackPlugin({
      chunks: ['playground'],
      filename: 'playground.html',
      inject: true,
      template: 'playground.html',
      title: 'Relay Playground',
    }),
  ].concat(process.env.NODE_ENV === 'production'
    ? [
      new UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false,
        },
        mangle: {
          except: [
            // Babel does a constructor.name check for 'Plugin'.
            'Plugin',
            // We do a constructor.name check to make sure that the developer is
            // trying to ReactDOM.render() a Relay.RootContainer into the
            // playground
            'RelayRootContainer',
          ],
        },
        sourceMap: false,
      }),
    ]
    : []
  ),
};
