/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict';

const BabelPluginRelay = require('../../dist/babel-plugin-relay');

const assign = require('object-assign');
const babel = require('babel-core');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const getBabelOptions = require('../getBabelOptions');
const path = require('path');

const {testSchemaPath} = require('../../dist/relay-test-utils');

const babelOptions = getBabelOptions({
  env: 'test',
  // Tests use a Promise polfill so they can use jest.runAllTimers().
  autoImport: true,
  moduleMap: {
    babylon: 'babylon',
    immutable: 'immutable',
    React: 'react',
    reactComponentExpect: 'react-dom/lib/reactComponentExpect',
    ReactDOM: 'react-dom',
    ReactDOMServer: 'react-dom/server',
    ReactTestRenderer: 'react-test-renderer',
    ReactTestUtils: 'react-dom/test-utils',
  },
  plugins: [
    [
      BabelPluginRelay,
      {
        compat: true,
        haste: true,
        substituteVariables: true,
        schema: testSchemaPath,
      },
    ],
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
    testSchemaPath,
    // We cannot have trailing commas in this file for node < 8
    // prettier-ignore
    path.join(
      path.dirname(require.resolve('babel-preset-fbjs')),
      'package.json'
    ),
    path.join(__dirname, '..', 'getBabelOptions.js'),
  ]),
};
