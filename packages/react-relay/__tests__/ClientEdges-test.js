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

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {Environment, Network, RecordSource, graphql} = require('relay-runtime');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

let networkSink;
let environment;
let fetchFn;
beforeEach(() => {
  fetchFn = jest.fn(() =>
    // $FlowFixMe[missing-local-annot] Error found while enabling LTI on this file
    RelayObservable.create(sink => {
      networkSink = sink;
    }),
  );

  environment = new Environment({
    store: new RelayModernStore(
      new RecordSource({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
        },
      }),
    ),
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    network: Network.create(fetchFn),
  });
});

it('should fetch and render client-edge query', () => {
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const variables = {id: '4'};
  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query ClientEdgesTest1Query($id: ID!) {
          me {
            client_node(id: $id) @waterfall {
              ... on User {
                name
              }
            }
          }
        }
      `,
      variables,
    );
    return data.me?.client_node?.name;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent />);
  });
  expect(fetchFn.mock.calls.length).toEqual(1);
  // We should send the client-edge query
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][0].name).toBe(
    'ClientEdgeQuery_ClientEdgesTest1Query_me__client_node',
  );
  // Check variables
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][1]).toEqual(variables);
  expect(renderer?.toJSON()).toBe('Loading');

  TestRenderer.act(() => {
    // This should resolve client-edge query
    networkSink.next({
      data: {
        node: {
          id: '4',
          __typename: 'User',
          name: 'Alice',
        },
      },
    });
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toBe('Alice');
});

// The Relay store does not have a concept of _records_ being null. This means that when a Node
// query returns null, we can't actally write to the store "The record with this ID is null".
// Instead, we just write that `node(id: 4): null` into the root record in the store.
//
// This is a general limitiaton of node fetches in Relay today.
it('should fetch and render `undefined` for client-edge to server query that returns `null`.', () => {
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const variables = {id: '4'};
  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query ClientEdgesTest2Query($id: ID!) {
          me {
            client_node(id: $id) @waterfall {
              ... on User {
                name
              }
            }
          }
        }
      `,
      variables,
    );
    if (data.me?.client_node === undefined) {
      return 'client_node is undefined';
    }
    return data.me?.client_node?.name ?? 'MISSING';
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent />);
  });
  expect(fetchFn.mock.calls.length).toEqual(1);
  // We should send the client-edge query
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][0].name).toBe(
    'ClientEdgeQuery_ClientEdgesTest2Query_me__client_node',
  );
  // Check variables
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][1]).toEqual(variables);
  expect(renderer?.toJSON()).toBe('Loading');

  TestRenderer.act(() => {
    // This should resolve client-edge query
    networkSink.next({
      data: {
        node: null,
      },
    });
    // It is important to complete network request here,
    // otherwise, client-edge query will think that the query is still in progress
    // and will show a suspense placeholder
    networkSink.complete();
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toBe('client_node is undefined');
  expect(fetchFn.mock.calls.length).toBe(1);
});

it('should throw for missing client-edge field data marked with @required', () => {
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const variables = {id: '4'};
  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query ClientEdgesTest3Query($id: ID!) {
          me {
            client_node(id: $id) @waterfall @required(action: THROW) {
              ... on User {
                name
              }
            }
          }
        }
      `,
      variables,
    );
    return data.me?.client_node?.name;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(<TestComponent />);
  });
  expect(fetchFn.mock.calls.length).toEqual(1);
  // We should send the client-edge query
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][0].name).toBe(
    'ClientEdgeQuery_ClientEdgesTest3Query_me__client_node',
  );
  // Check variables
  // $FlowFixMe[invalid-tuple-index] Error found while enabling LTI on this file
  expect(fetchFn.mock.calls[0][1]).toEqual(variables);
  expect(renderer?.toJSON()).toBe('Loading');

  TestRenderer.act(() => {
    networkSink.next({
      data: {
        node: null,
      },
    });
    jest.runAllImmediates();
  });
  // Still waiting, maybe the data will be there
  expect(renderer?.toJSON()).toBe('Loading');

  expect(() => {
    TestRenderer.act(() => {
      // This should resolve client-edge query
      networkSink.complete();
      jest.runAllImmediates();
    });
  }).toThrow(
    "Relay: Missing @required value at path 'me.client_node' in 'ClientEdgesTest3Query'.",
  );
  expect(renderer?.toJSON()).toBe(null);
});

it('should throw for missing client-edge (client object) field data marked with @required', () => {
  function TestComponent() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <InnerComponent />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }
  const variables = {return_null: true};
  function InnerComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query ClientEdgesTest4Query($return_null: Boolean!) {
          me {
            client_object(return_null: $return_null) @required(action: THROW) {
              description
            }
          }
        }
      `,
      variables,
    );

    return data.me?.client_object?.description;
  }
  expect(() => {
    TestRenderer.act(() => {
      TestRenderer.create(<TestComponent />);
    });
  }).toThrow(
    "Relay: Missing @required value at path 'me.client_object' in 'ClientEdgesTest4Query'.",
  );
  expect(fetchFn.mock.calls.length).toEqual(0);
});
