/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// TODO: sync babel config with gulpfile. There are differences (eg, we don't
// want to use the DEV plugin).

var assign = require('object-assign');
var babel = require('babel-core');
var babelDefaultOptions = require('fbjs-scripts/babel/default-options');
var createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
var fs = require('fs');
var getBabelRelayPlugin = require('../babel-relay-plugin');
var path = require('path');

var SCHEMA_PATH = path.resolve(__dirname, 'testschema.json');

var graphQLPlugin = getBabelRelayPlugin(
  JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8')).data
);

// Fix the path to node_modules because jest is slooow with
// node_modules paths (facebook/jest#465)
function fixModules(list) {
  Object.keys(list).forEach(function(moduleName) {
    list[moduleName] = __dirname + '/../../node_modules/' + list[moduleName];
  });
  return list;
}

var babelOptions = assign(
  {},
  babelDefaultOptions,
  {
    plugins: babelDefaultOptions.plugins.concat([graphQLPlugin]),
    retainLines: true,
    _moduleMap: fixModules(assign({}, require('fbjs/module-map'), {
      'React': 'react',
      'ReactUpdates': 'react/lib/ReactUpdates',
      'StaticContainer.react': 'react-static-container'
    }))
  }
);

module.exports = {
  process: function(src, path) {
    return babel.transform(src, assign({filename: path}, babelOptions)).code;
  },

  getCacheKey: createCacheKeyFunction([
    __filename,
    SCHEMA_PATH,
    path.join(
      __dirname,
      '..',
      '..',
      'node_modules',
      'babel-relay-plugin',
      'package.json'
    )
  ])
};
