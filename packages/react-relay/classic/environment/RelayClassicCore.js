/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayFragmentSpecResolver = require('./RelayFragmentSpecResolver');

const {
  getClassicFragment,
  getClassicOperation,
} = require('../query/RelayGraphQLTag');
const {createOperationSelector} = require('./RelayOperationSelector');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('./RelaySelector');

import type {
  FragmentSpecResolver,
  Props,
} from './RelayCombinedEnvironmentTypes';
import type {FragmentMap, RelayContext} from './RelayEnvironmentTypes';

function createFragmentSpecResolver(
  context: RelayContext,
  containerName: string,
  fragments: FragmentMap,
  props: Props,
  callback?: () => void,
): FragmentSpecResolver {
  return new RelayFragmentSpecResolver(context, fragments, props, callback);
}

/**
 * The classic implementation of the `RelayCore` interface defined in
 * `RelayEnvironmentTypes`.
 */
module.exports = {
  areEqualSelectors,
  createFragmentSpecResolver,
  createOperationSelector,
  getDataIDsFromObject,
  getFragment: getClassicFragment,
  getRequest: getClassicOperation,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
};
