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
const getBabelRelayPlugin = require('../babel-relay-plugin');
const getSchemaIntrospection = require('../../packages/babel-plugin-relay/getSchemaIntrospection');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '../../packages/relay-compiler/testutils/testschema.graphql');

const schema = getSchemaIntrospection(SCHEMA_PATH);

const babelOptions = getBabelOptions({
  env: 'test',
  moduleMap: {
    'React': 'react',
    'reactComponentExpect': 'react-dom/lib/reactComponentExpect',
    'ReactDOM': 'react-dom',
    'ReactDOMServer': 'react-dom/server',
    'ReactTestRenderer': 'react-test-renderer',
    'ReactTestUtils': 'react-addons-test-utils',
    'StaticContainer.react': 'react-static-container',
  },
  plugins: [
    [BabelPluginRelay, {compat: true, haste: true, relayQLModule: 'RelayQL'}],
    getBabelRelayPlugin(schema, {substituteVariables: true}),
    require('babel-plugin-transform-async-to-generator'),
    require('babel-plugin-transform-regenerator'),
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
    path.join(__dirname, '..', 'babel-relay-plugin', 'package.json'),
    path.join(path.dirname(require.resolve('babel-preset-fbjs')), 'package.json'),
    path.join(__dirname, '..', 'getBabelOptions.js'),
  ]),
};
