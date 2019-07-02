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
const {createOperationDescriptor} = require('./RelayModernOperationDescriptor');
const {
  areEqualSelectors,
  getDataIDsFromFragment,
  getDataIDsFromObject,
  getSingularSelector,
  getPluralSelector,
  getSelector,
  getSelectorsFromObject,
  getVariablesFromSingularFragment,
  getVariablesFromPluralFragment,
  getVariablesFromFragment,
  getVariablesFromObject,
} = require('./RelayModernSelector');

import type {
  FragmentMap,
  FragmentSpecResolver,
  Props,
  RelayContext,
} from './RelayStoreTypes';

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
  createOperationDescriptor,
  getDataIDsFromFragment,
  getDataIDsFromObject,
  getFragment,
  getPaginationFragment,
  getRefetchableFragment,
  getRequest,
  getSingularSelector,
  getPluralSelector,
  getSelector,
  getSelectorsFromObject,
  getVariablesFromSingularFragment,
  getVariablesFromPluralFragment,
  getVariablesFromFragment,
  getVariablesFromObject,
  isFragment,
  isRequest,
};
