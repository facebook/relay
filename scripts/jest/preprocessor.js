/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const assign = require('object-assign');
const babel = require('babel-core');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const fs = require('fs');
const getBabelOptions = require('../getBabelOptions');
const getBabelRelayPlugin = require('../babel-relay-plugin');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, 'testschema.json');

const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).data;

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
    getBabelRelayPlugin(schema, {substituteVariables: true}),
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
