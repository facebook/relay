/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const isNodeGlobalDefined = typeof global !== 'undefined';

const ExecutionEnvironment: {|+isServer: boolean|} = {
  isServer: !canUseDOM && isNodeGlobalDefined,
};

module.exports = ExecutionEnvironment;
