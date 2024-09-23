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

const loadSchema = require('./loadSchema');
const cosmiconfig = require('cosmiconfig');

function loadConfig(folder?: string): any | void {
  const schema = loadSchema();

  const result = cosmiconfig('relay', {
    searchPlaces: ['relay.config.js', 'relay.config.json', 'package.json'],
  }).searchSync(folder);
  if (!result) {
    return;
  }
  const {config, filepath} = result;

  schema.validateObject(config, filepath);
  return config;
}

module.exports = loadConfig;
