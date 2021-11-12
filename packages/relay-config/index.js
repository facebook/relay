/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const cosmiconfig = require('cosmiconfig');

const explorer = cosmiconfig('relay', {
  searchPlaces: ['relay.config.js', 'relay.config.json', 'package.json'],

  loaders: {
    '.json': cosmiconfig.loadJson,
    '.yaml': cosmiconfig.loadYaml,
    '.yml': cosmiconfig.loadYaml,
    '.js': cosmiconfig.loadJs,
    '.es6': cosmiconfig.loadJs,
    noExt: cosmiconfig.loadYaml,
  },
});

function loadConfig(): $FlowFixMe {
  const result = explorer.searchSync();
  if (result) {
    return result.config;
  }
}

module.exports = {loadConfig};
