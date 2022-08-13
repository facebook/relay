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

import type {RelayFlightUseFragmentTestViewerQuery} from 'RelayFlightUseFragmentTestViewerQuery.graphql';

import {
  initialize_INTERNAL_DO_NOT_USE,
  useFragment,
  useQuery,
} from 'RelayFlight.server';
import * as OperationMap from 'RelayFlightOperationMap.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';

import {
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} from 'relay-runtime';

initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

beforeEach(() => {
  OperationMap.clear();
});

test('useFragment(): should return data for the fragment', () => {
  const ViewerQuery = getRequest(graphql`
    query RelayFlightUseFragmentTestViewerQuery {
      viewer {
        actor {
          ...RelayFlightUseFragmentTestUserFragment
        }
      }
    }
  `);
  const UserFragment = getFragment(graphql`
    fragment RelayFlightUseFragmentTestUserFragment on User {
      # eslint-disable-next-line relay/unused-fields
      name
    }
  `);

  // First, we need to fetch a query
  let thenable;
  try {
    useQuery<RelayFlightUseFragmentTestViewerQuery>(ViewerQuery, {});
  } catch (thrownObj) {
    thenable = thrownObj;
  }
  expect(thenable).not.toBe(null);
  const operation = createOperationDescriptor(ViewerQuery, {});
  const operationKey = OperationMap.getOperationKey(operation);
  OperationMap.setOperationResult(operationKey, {
    viewer: {
      actor: {
        __typename: 'User',
        name: 'Alice',
      },
    },
  });

  const data = useQuery<RelayFlightUseFragmentTestViewerQuery>(ViewerQuery, {});
  // $FlowFixMe[incompatible-call] discovered when improving types of useFragment
  const user = useFragment(UserFragment, data.viewer?.actor);
  expect(user).toEqual({
    name: 'Alice',
  });
});
