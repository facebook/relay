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

import type RelayObservable from '../network/RelayObservable';
import type {FragmentState} from './observeFragmentExperimental';
import type {OperationDescriptor} from './RelayStoreTypes';
import type {Fragment, IEnvironment, Query, Variables} from 'relay-runtime';

const {observeFragment} = require('./observeFragmentExperimental');
const {createOperationDescriptor} = require('./RelayModernOperationDescriptor');

/**
 * This function returns an observable that can be used to subscribe to the data
 * contained in a query. It does not return the full response shape, but rather
 * the contents of the query body minus any fragment spreads.  If you wish to
 * read the contents of a fragment spread into this query you may pass the
 * object into which the fragment was spread to `observeFragment`.
 *
 * NOTE: `observeQuery` assumes that you have already fetched and retained the
 * query via some other means, such as `fetchQuery`.
 *
 * This feature is still experimental and does not properly handle some resolver
 * features such as client-to-server edges.
 */
function observeQuery<TVariables: Variables, TData>(
  environment: IEnvironment,
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
): RelayObservable<FragmentState<TData>> {
  const operation: OperationDescriptor = createOperationDescriptor(
    gqlQuery,
    variables,
  );

  const rootFragmentRef: $FlowFixMe = {
    __id: operation.fragment.dataID,
    __fragments: {
      [operation.fragment.node.name]: operation.request.variables,
    },
    __fragmentOwner: operation.request,
  };

  const fragmentNode: Fragment<$FlowFixMe, TData> = (operation.request.node
    .fragment: $FlowFixMe);

  return observeFragment(environment, fragmentNode, rootFragmentRef);
}

module.exports = {
  observeQuery,
};
