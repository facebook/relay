/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {NormalizationOperation} from 'relay-runtime/util/NormalizationNode';

function isExecTimeResolversEnabled(
  operation: NormalizationOperation,
): boolean {
  return (
    (operation.use_exec_time_resolvers ??
      operation.exec_time_resolvers_enabled_provider?.get()) === true
  );
}

module.exports = {
  isExecTimeResolversEnabled,
};
