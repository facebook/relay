/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayLegacyCore
 * @flow
 */

'use strict';

const {
  getLegacyFragment,
  getLegacyOperation,
} = require('RelayGraphQLTag');
const {createOperationSelector} = require('RelayOperationSelector');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('RelaySelector');

/**
 * The legacy implementation of the `RelayCore` interface defined in
 * `RelayEnvironmentTypes`.
 */
module.exports = {
  areEqualSelectors,
  createOperationSelector,
  getDataIDsFromObject,
  getFragment: getLegacyFragment,
  getOperation: getLegacyOperation,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
};
