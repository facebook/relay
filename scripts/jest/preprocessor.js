/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const getBabelOptions = require('../getBabelOptions');
const babel = require('@babel/core');
const createCacheKeyFunction =
  require('@jest/create-cache-key-function').default;
const path = require('path');

const babelOptions = getBabelOptions({
  env: 'test',
  // Tests use a Promise polfill so they can use jest.runAllTimers().
  autoImport: true,
  plugins: [
    './dist/babel-plugin-relay',
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-async-to-generator',
  ],
});

module.exports = {
  process: function (src, filename) {
    const options = Object.assign({}, babelOptions, {
      filename: filename,
      retainLines: true,
    });
    return babel.transform(src, options).code;
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
