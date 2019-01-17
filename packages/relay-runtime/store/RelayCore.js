/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayModernFragmentSpecResolver = require('./RelayModernFragmentSpecResolver');

const warning = require('warning');

const {
  getFragment,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  isFragment,
  isRequest,
} = require('../query/RelayModernGraphQLTag');
const {createFragmentOwner} = require('./RelayModernFragmentOwner');
const {createOperationSelector} = require('./RelayModernOperationSelector');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('./RelayModernSelector');

import type {
  FragmentSpecResolver,
  Props,
} from '../util/RelayCombinedEnvironmentTypes';
import type {FragmentMap, RelayContext} from './RelayStoreTypes';

function createFragmentSpecResolver(
  context: RelayContext,
  containerName: string,
  fragments: FragmentMap,
  props: Props,
  callback?: () => void,
): FragmentSpecResolver {
  if (__DEV__) {
    const fragmentNames = Object.keys(fragments);
    fragmentNames.forEach(fragmentName => {
      const propValue = props[fragmentName];
      warning(
        propValue !== undefined,
        'createFragmentSpecResolver: Expected prop `%s` to be supplied to `%s`, but ' +
          'got `undefined`. Pass an explicit `null` if this is intentional.',
        fragmentName,
        containerName,
      );
    });
  }

  return new RelayModernFragmentSpecResolver(
    context,
    fragments,
    props,
    callback,
  );
}

module.exports = {
  areEqualSelectors,
  createFragmentSpecResolver,
  createFragmentOwner,
  createOperationSelector,
  getDataIDsFromObject,
  getFragment,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
  isFragment,
  isRequest,
};
