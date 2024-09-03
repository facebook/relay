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

const loadConfig = require('../loadConfig');
const mockFs = require('mock-fs');

describe('loadConfig', () => {
  beforeEach(() => {
    mockFs({
      '/app/package.json': JSON.stringify({name: 'my-app', version: '1.0.0'}),
      '/bad-config/relay.config.json': JSON.stringify({}),
      '/other-app/package.json': JSON.stringify({
        name: 'my-other-app',
        version: '2.0.0',
        relay: {
          language: 'typescript',
        },
      }),
      '/another-app/relay.config.json': JSON.stringify({
        language: 'typescript',
      }),
      '/and-another-app/relay.config.js': `module.exports = ${JSON.stringify({language: 'typescript'})}`,
    });
  });
  afterEach(mockFs.restore);

  it('Returns undefined if there is no config available', () => {
    expect(loadConfig('/app')).toBeUndefined();
  });

  it('Fails if the config is invalid', () => {
    expect(() => loadConfig('/bad-config')).toThrow();
  });

  it('Properly loads relay.config.js files', () => {
    expect(loadConfig('/other-app')).toEqual({language: 'typescript'});
  });

  it('Properly loads relay.config.json files', () => {
    expect(loadConfig('/another-app')).toEqual({language: 'typescript'});
  });

  it('Properly loads package.json config', () => {
    expect(loadConfig('/and-another-app')).toEqual({language: 'typescript'});
  });
});
