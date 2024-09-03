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

const saveConfig = require('../saveConfig');
const {FileSystem} = require('@rushstack/node-core-library');
const mockFs = require('mock-fs');

describe('saveConfig', () => {
  beforeEach(() => {
    mockFs({
      '/app/package.json': JSON.stringify({name: 'my-app', version: '1.0.0'}),
    });
  });
  afterEach(mockFs.restore);

  it("Fails if package.json doesn't exist and the config type is package.json", () => {
    expect(() =>
      saveConfig({language: 'typescript'}, '/app', 'package.json'),
    ).toThrow();
  });

  it('Fails if the config is invalid', () => {
    expect(() => saveConfig({}, '/app', 'relay.config.json')).toThrow();
  });

  it('Properly saves relay.config.js files', () => {
    saveConfig({language: 'typescript'}, '/app', 'relay.config.js');
    expect(FileSystem.readFile('/app/relay.config.js')).toMatchSnapshot();
  });

  it('Properly saves relay.config.json files', () => {
    saveConfig({language: 'typescript'}, '/app', 'relay.config.json');
    expect(FileSystem.readFile('/app/relay.config.json')).toMatchSnapshot();
  });

  it('Properly saves package.json config', () => {
    saveConfig({language: 'typescript'}, '/app', 'package.json');
    expect(FileSystem.readFile('/app/package.json')).toMatchSnapshot();
  });
});
