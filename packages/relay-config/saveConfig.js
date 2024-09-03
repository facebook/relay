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
const {FileSystem, JsonFile} = require('@rushstack/node-core-library');
const path = require('path');

function saveConfig(
  config: any,
  folder: string,
  configType: 'relay.config.js' | 'relay.config.json' | 'package.json',
): void {
  const schema = loadSchema();
  schema.validateObject(config, '');

  const configPath = path.join(folder, configType);
  switch (configType) {
    case 'relay.config.js':
      return FileSystem.writeFile(
        configPath,
        `module.exports = ${JSON.stringify(config, undefined, 4)};`,
      );
    case 'relay.config.json':
      return JsonFile.save(config, configPath);
    case 'package.json':
      const packageJson = JsonFile.load(path);
      packageJson.relay = config;
      return JsonFile.save(packageJson, configPath, {
        onlyIfChanged: true,
        updateExistingFile: true,
      });
  }
}

module.exports = saveConfig;
