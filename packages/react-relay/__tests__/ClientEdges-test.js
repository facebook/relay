/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  RecordSource,
  RelayFeatureFlags,
  graphql,
} = require('relay-runtime');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

describe('ClientEdges', () => {
  let networkSink;
  let environment;
  let fetchFn;
  beforeEach(() => {
    fetchFn = jest.fn(() =>
      RelayObservable.create(sink => {
        networkSink = sink;
      }),
    );

    environment = new Environment({
      store: new LiveResolverStore(
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
    expect(fetchFn.mock.calls[0][0].name).toBe(
      'ClientEdgeQuery_ClientEdgesTest1Query_me__client_node',
    );
    // Check variables
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

  it('should fetch and render `null` for client-edge query that returns `null`.', () => {
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
      return data.me?.client_node?.name ?? 'MISSING';
    }

    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(<TestComponent />);
    });
    expect(fetchFn.mock.calls.length).toEqual(1);
    // We should send the client-edge query
    expect(fetchFn.mock.calls[0][0].name).toBe(
      'ClientEdgeQuery_ClientEdgesTest2Query_me__client_node',
    );
    // Check variables
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
    expect(renderer?.toJSON()).toBe('MISSING');
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
    expect(fetchFn.mock.calls[0][0].name).toBe(
      'ClientEdgeQuery_ClientEdgesTest3Query_me__client_node',
    );
    // Check variables
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
    // See UserClientEdgeClientObjectResolver: for `0` we should return `null` for `client_object`.
    const variables = {id: '0'};
    function InnerComponent() {
      const data = useLazyLoadQuery(
        graphql`
          query ClientEdgesTest4Query($id: ID!) {
            me {
              client_object(id: $id) @required(action: THROW) {
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
});
