/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCore
 * @flow
 * @format
 */

'use strict';

const RelayModernFragmentSpecResolver = require('RelayModernFragmentSpecResolver');

const warning = require('warning');

const {getFragment, getOperation} = require('RelayModernGraphQLTag');
const {createOperationSelector} = require('RelayModernOperationSelector');
const {
  areEqualSelectors,
  getDataIDsFromObject,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('RelayModernSelector');

import type {FragmentSpecResolver, Props} from 'RelayCombinedEnvironmentTypes';
import type {FragmentMap, RelayContext} from 'RelayStoreTypes';

function createFragmentSpecResolver(
  context: RelayContext,
  containerName: string,
  fragments: FragmentMap,
  props: Props,
  callback: () => void,
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
  createOperationSelector,
  getDataIDsFromObject,
  getFragment,
  getOperation,
  getSelector,
  getSelectorList,
  getSelectorsFromObject,
  getVariablesFromObject,
};
