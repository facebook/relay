/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

const loadConfigValidator = require('./loadConfigValidator');
const cosmiconfig = require('cosmiconfig');

function loadConfig(folder?: string): any | void {
  const result = cosmiconfig('relay', {
    searchPlaces: ['relay.config.js', 'relay.config.json', 'package.json'],
  }).searchSync(folder);
  if (!result) {
    return;
  }
  const {config, filepath} = result;

  const validate = loadConfigValidator();
  validate(config, filepath);
  return config;
}

module.exports = loadConfig;
