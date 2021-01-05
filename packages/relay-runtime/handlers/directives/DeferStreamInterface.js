/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

type DeferStreamConfig = {|
  INITIAL_COUNT: string,
  LABEL: string,
  IF: string,
  USE_CUSTOMIZED_BATCH: string,
|};

let config: DeferStreamConfig = {
  INITIAL_COUNT: 'initialCount',
  LABEL: 'label',
  IF: 'if',
  USE_CUSTOMIZED_BATCH: 'useCustomizedBatch',
};

/**
 * @internal
 *
 * Defines logic relevant to the @stream directive.
 */
const DeferStreamInterface = {
  inject(newConfig: DeferStreamConfig) {
    config = newConfig;
  },

  get(): DeferStreamConfig {
    return config;
  },
};

module.exports = DeferStreamInterface;
