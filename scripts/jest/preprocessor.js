/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const BabelPluginRelay = require('../../dist/babel-plugin-relay');

const assign = require('object-assign');
const babel = require('babel-core');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const getBabelOptions = require('../getBabelOptions');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '../../packages/relay-compiler/testutils/testschema.graphql');

const babelOptions = getBabelOptions({
  env: 'test',
  // Tests use a Promise polfill so they can use jest.runAllTimers().
  autoImport: true,
  moduleMap: {
    'immutable': 'immutable',
    'React': 'react',
    'reactComponentExpect': 'react-dom/lib/reactComponentExpect',
    'ReactDOM': 'react-dom',
    'ReactDOMServer': 'react-dom/server',
    'ReactTestRenderer': 'react-test-renderer',
    'ReactTestUtils': 'react-dom/test-utils',
    'StaticContainer.react': 'react-static-container',
  },
  plugins: [
    [BabelPluginRelay, {
      compat: true,
      haste: true,
      relayQLModule: 'RelayQL',
      substituteVariables: true,
      schema: SCHEMA_PATH,
    }],
    require('babel-plugin-transform-async-to-generator'),
  ],
});

module.exports = {
  process: function(src, filename) {
    const options = assign({}, babelOptions, {
      filename: filename,
      retainLines: true,
    });
    return babel.transform(src, options).code;
  },

  getCacheKey: createCacheKeyFunction([
    __filename,
    SCHEMA_PATH,
    path.join(path.dirname(require.resolve('babel-preset-fbjs')), 'package.json'),
    path.join(__dirname, '..', 'getBabelOptions.js'),
  ]),
};
