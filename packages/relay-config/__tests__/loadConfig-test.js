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

const loadConfig = require('../loadConfig');
const path = require('path');

describe('loadConfig', () => {
  it('Returns undefined if there is no config available', () => {
    expect(
      loadConfig(path.join(__dirname, 'fixtures/no-config')),
    ).toBeUndefined();
  });

  it('Fails if the config is invalid', () => {
    expect(() =>
      loadConfig(path.join(__dirname, 'fixtures/invalid-config')),
    ).toThrow();
  });

  it('Properly loads relay.config.js files', () => {
    expect(loadConfig(path.join(__dirname, 'fixtures/js-config'))).toEqual({
      language: 'typescript',
      schema: 'schema.graphql',
    });
  });

  it('Properly loads relay.config.json files', () => {
    expect(loadConfig(path.join(__dirname, 'fixtures/json-config'))).toEqual({
      language: 'typescript',
      schema: 'schema.graphql',
    });
  });

  it('Properly loads package.json config', () => {
    expect(
      loadConfig(path.join(__dirname, 'fixtures/package-json-config')),
    ).toEqual({
      language: 'typescript',
      schema: 'schema.graphql',
    });
  });
});
