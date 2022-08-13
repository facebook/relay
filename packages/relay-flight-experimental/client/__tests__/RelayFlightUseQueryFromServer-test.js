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

import ReactTestRenderer from 'ReactTestRenderer';
import {useQueryFromServer} from 'RelayFlight.client';
import {
  initialize_INTERNAL_DO_NOT_USE,
  loadQueryForClient,
} from 'RelayFlight.server';
import RelayFlightServerImpl from 'RelayFlightServerImpl.server';
import {RelayEnvironmentProvider, loadQuery} from 'RelayHooks';

import * as React from 'react';
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
  getRequest,
  graphql,
} from 'relay-runtime';

initialize_INTERNAL_DO_NOT_USE(RelayFlightServerImpl);

let ViewerQuery;
let fetch;
let subject; // eslint-disable-line no-unused-vars
let environment;
let values;
let Component;

beforeEach(() => {
  ViewerQuery = graphql`
    query RelayFlightUseQueryFromServerTestQuery {
      viewer {
        actor {
          name
        }
      }
    }
  `;
  // $FlowFixMe
  ViewerQuery.params.id = 'id<ViewerQuery>';
  fetch = jest.fn((_query, _variables, _cacheConfig) =>
    Observable.create(sink => {
      subject = sink;
    }),
  );
  environment = new Environment({
    network: Network.create(fetch),
    store: new Store(RecordSource.create()),
  });
  values = [];
  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */
  Component = props => {
    const data = useQueryFromServer(ViewerQuery, props.query);
    values.push(data);
    return data?.viewer?.actor?.name ?? null;
  };
});

test('renders null when data is missing and query is not loading', () => {
  const query = loadQueryForClient((ViewerQuery: $FlowFixMe), {});
  const renderer = ReactTestRenderer.create(
    <React.Suspense fallback="Fallback">
      <RelayEnvironmentProvider environment={environment}>
        <Component query={query} />
      </RelayEnvironmentProvider>
    </React.Suspense>,
  );
  expect(renderer.toJSON()).toBe(null);
});

test('renders fallback when data is missing and query is loading', () => {
  const query = loadQueryForClient((ViewerQuery: $FlowFixMe), {});
  const renderer = ReactTestRenderer.create(
    <React.Suspense fallback="Fallback">
      <RelayEnvironmentProvider environment={environment}>
        <Component query={query} />
      </RelayEnvironmentProvider>
    </React.Suspense>,
  );
  loadQuery(environment, ViewerQuery, {});
  expect(renderer.toJSON()).toBe(null);
});

test('renders data when available', () => {
  const query = loadQueryForClient((ViewerQuery: $FlowFixMe), {});
  const operation = createOperationDescriptor(getRequest(ViewerQuery), {});
  environment.commitPayload(operation, {
    viewer: {
      actor: {
        __typename: 'User',
        id: '4',
        name: 'Zuck',
      },
    },
  });
  const renderer = ReactTestRenderer.create(
    <React.Suspense fallback="Fallback">
      <RelayEnvironmentProvider environment={environment}>
        <Component query={query} />
      </RelayEnvironmentProvider>
    </React.Suspense>,
  );
  expect(renderer.toJSON()).toBe('Zuck');
});
