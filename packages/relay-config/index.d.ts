/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

import { ConfigFile as RelayConfig } from './RelayConfig';

declare function loadConfig(): Promise<RelayConfig>;

declare function saveConfig(
  config: RelayConfig,
  folder: string,
  configType: 'relay.config.js' | 'relay.config.json' | 'package.json',
): Promise<void>;

export { loadConfig, saveConfig, RelayConfig };