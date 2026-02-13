/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const getBabelOptions = require('../getBabelOptions');
const babel = require('@babel/core');
const createCacheKeyFunction =
  require('@jest/create-cache-key-function').default;
const path = require('path');

// babel-plugin-relay requires relay-config, which is a sibling in dist.
process.env.NODE_PATH = [
  process.env.NODE_PATH,
  path.resolve(__dirname, '..', '..', 'dist'),
]
  .filter(Boolean)
  .join(path.delimiter);
require('module')._initPaths();

const babelOptions = getBabelOptions({
  env: 'test',
  autoImport: false,
  plugins: [
    ['./dist/babel-plugin-relay', {eagerEsModules: false}],
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    'babel-plugin-syntax-hermes-parser',
  ],
});

module.exports = {
  process: function (src, filename) {
    const options = Object.assign({}, babelOptions, {
      filename: filename,
      retainLines: true,
    });
    return babel.transform(src, options);
  },

  getCacheKey: createCacheKeyFunction([
    __filename,
    // We cannot have trailing commas in this file for node < 8
    // prettier-ignore
    path.join(
      path.dirname(require.resolve('babel-preset-fbjs')),
      'package.json'
    ),
    path.join(__dirname, '..', 'getBabelOptions.js'),
  ]),
};
