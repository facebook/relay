/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {RequestDescriptor} from 'relay-runtime';

import * as RelayFlightParentOperation from 'RelayFlightParentOperation.server';

import {FRAGMENT_OWNER_KEY} from 'relay-runtime';

/**
 * This function is to used "serialize" the fragment refs that are passed over
 * the network to client components that use @relay_client_component, and ensure
 * that they have the correct fragment owner. That is, the owner that corresponds
 * to the client query that queried for the Server Component originally, and
 * not the server query.
 *
 * In the future, we will encode this logic into RelayReader and remove this api.
 */
export default function loadFragmentForClient<TFragmentRef>(
  fragmentRef: TFragmentRef,
): TFragmentRef {
  const parentOperationIdentifier =
    RelayFlightParentOperation.getParentOperationRequestIdentifier();
  const parentOperationVariables =
    RelayFlightParentOperation.getParentOperationVariables();
  const parentOperationRequestParameters =
    RelayFlightParentOperation.getParentOperationRequestParamters();

  const fragmentOwner: RequestDescriptor = {
    identifier: parentOperationIdentifier,
    // We don't want to send the operation AST over the wire since it's
    // very large, and completely unused for the purposes of the fragment owner
    // so we can get away with lying about the value here.
    // The correct fix is to make the representation of fragment owners more
    // compact and not include the operation ast, since it's unused.
    // TODO(T87014866): Make fragment owner representation more compact.
    node: ({
      params: parentOperationRequestParameters,
    }: $FlowFixMe),
    variables: parentOperationVariables,
    // The cacheConfig is also completely unused for the purposes of the
    // fragment owner.
    // TODO(T87014866): Make fragment owner representation more compact.
    cacheConfig: null,
  };

  // The input fragment ref is the prop that will be serialized over the
  // network and passed to the client component that uses/reads the fragment.
  // The input fragment ref currently has an owner that corresponds to the
  // server query for the Server Component that is currently being rendered.
  // However, the fragment ref that we pass to the client component must
  // have a fragment owner that corresponds to the client query that originally
  // queried for the Server Component, so here we set the correct fragment owner
  // on the fragment ref.
  return {
    ...fragmentRef,
    [FRAGMENT_OWNER_KEY]: fragmentOwner,
  };
}
