/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {GraphQLResponse} from 'relay-runtime/network/RelayNetworkTypes';

const RelayEnvironmentProvider = require('../../RelayEnvironmentProvider');
const useLazyLoadQuery = require('../../useLazyLoadQuery');
const serverPreloadQuery = require('../serverPreloadQuery');
const useQueryFromServer = require('../useQueryFromServer');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();

// `@connection` compiles to a LinkedHandle, and normalization turns a handle
// into a field payload rather than a record. A client that only publishes the
// normalized source never creates the record the handle stands for, so the
// store cannot satisfy this query.
const ConnectionQuery = graphql`
  query useQueryFromServerTestConnectionQuery($id: ID!) {
    node(id: $id) {
      ... on Feedback {
        id
        comments(first: 2)
          @connection(key: "useQueryFromServerTestConnectionQuery_comments") {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

// No `@connection`, for the cases that are about publishing rather than about
// handle payloads. With one, they would fail for the wrong reason.
const PlainQuery = graphql`
  query useQueryFromServerTestPlainQuery {
    me {
      id
      name
    }
  }
`;

describe('useQueryFromServer with a @connection', () => {
  it('BUG: suspends rather than rendering the payload it was handed', async () => {
    // Preload on a *server* environment, exactly as an RSC render does. Only
    // the returned ref crosses to the client — the store this populated, handle
    // records and all, does not.
    const serverEnviornment = new Environment({
      network: Network.create(() =>
        Observable.from({
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: {
                edges: [
                  {
                    cursor: 'cursor-1',
                    node: {__typename: 'Comment', id: 'node-1'},
                  },
                ],
                pageInfo: {hasNextPage: false, endCursor: 'cursor-1'},
              },
            },
          },
        }),
      ),
      store: new Store(new RecordSource()),
      isServer: true,
    });
    const queryRef = serverPreloadQuery(serverEnviornment, ConnectionQuery, {
      id: '<feedbackid>',
    });

    const environment = new Environment({
      // Never emits, so a fetch leaves the tree suspended forever.
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(() =>
        Observable.create<GraphQLResponse>(() => {}),
      ),
      store: new Store(new RecordSource()),
    });

    function Comments(): React.Node {
      const data = useQueryFromServer(ConnectionQuery, queryRef);
      return (data.node?.comments?.edges ?? [])
        .map(edge => edge?.node?.id)
        .join(',');
    }

    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <Comments />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    // Let `use(queryRef._response)` settle and the tree re-render.
    await TestRenderer.act(async () => {});

    // Should be 'node-1'. The connection record is missing, so the read comes
    // up short and Relay suspends on a fetch that will never resolve.
    expect(renderer.toJSON()).toEqual('Loading');
  });

  it('BUG: refetches data the server already sent', async () => {
    const serverEnvironment = new Environment({
      network: Network.create(() =>
        Observable.from({
          data: {
            node: {
              __typename: 'Feedback',
              id: '<feedbackid>',
              comments: {
                edges: [
                  {
                    cursor: 'cursor-1',
                    node: {__typename: 'Comment', id: 'node-1'},
                  },
                ],
                pageInfo: {hasNextPage: false, endCursor: 'cursor-1'},
              },
            },
          },
        }),
      ),
      store: new Store(new RecordSource()),
      isServer: true,
    });
    const queryRef = serverPreloadQuery(serverEnvironment, ConnectionQuery, {
      id: '<feedbackid>',
    });

    // A fetch here is already the bug: whatever the hook did with the server's
    // response, it did not leave the store able to answer the query.
    const fetch = jest.fn(() => Observable.create<GraphQLResponse>(() => {}));
    const environment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
    });

    function Comments(): React.Node {
      const data = useQueryFromServer(ConnectionQuery, queryRef);
      return (data.node?.comments?.edges ?? [])
        .map(edge => edge?.node?.id)
        .join(',');
    }

    TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <Comments />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(async () => {});

    // Should be 0. The whole point of preloading on the server is not to make
    // this request.
    expect(fetch).toBeCalledTimes(1);
  });
});

describe('useQueryFromServer publishing into a live store', () => {
  it('BUG: drops the payload when an optimistic update is reverted', async () => {
    const serverEnvironment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(() =>
        Observable.from({
          data: {me: {__typename: 'User', id: '4', name: 'Zuck'}},
        }),
      ),
      store: new Store(new RecordSource()),
      isServer: true,
    });
    const queryRef = serverPreloadQuery(serverEnvironment, PlainQuery, {});

    const environment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(() =>
        Observable.create<GraphQLResponse>(() => {}),
      ),
      store: new Store(new RecordSource()),
    });

    // An unrelated mutation is in flight, so the store is carrying an
    // optimistic layer when the hook publishes.
    const optimistic = environment.applyUpdate({
      storeUpdater: storeProxy => {
        storeProxy.create('client:unrelated', 'Comment');
      },
    });

    function Name(): React.Node {
      const data = useQueryFromServer(PlainQuery, queryRef);
      return data.me?.name ?? 'no name';
    }

    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <Name />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(async () => {});

    // Reads fine for now — the hook is reading through the same optimistic
    // layer it just wrote into.
    expect(renderer.toJSON()).toEqual('Zuck');

    // The mutation settles and its optimistic layer is thrown away.
    await TestRenderer.act(async () => {
      optimistic.dispose();
    });

    // Should be 'available'. `Store.publish` targets
    // `_optimisticSource ?? _recordSource`, so publishing outside the queue
    // while an optimistic update is applied writes into that layer, and
    // `restore()` takes the server's payload out with it. Permanently: the hook
    // has already marked this ref committed and will not publish it again.
    const operation = createOperationDescriptor(getRequest(PlainQuery), {});
    expect(environment.check(operation).status).toEqual('missing');
  });

  it('BUG: a mounted subscriber never sees the data the hook published', async () => {
    const serverEnvironment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(() =>
        Observable.from({
          data: {me: {__typename: 'User', id: '4', name: 'Zuck'}},
        }),
      ),
      store: new Store(new RecordSource()),
      isServer: true,
    });
    const queryRef = serverPreloadQuery(serverEnvironment, PlainQuery, {});

    const environment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(() =>
        Observable.create<GraphQLResponse>(() => {}),
      ),
      store: new Store(new RecordSource()),
    });

    // Someone is already reading `me` and holding a subscription, at the value
    // the store had before the server payload arrived.
    environment.commitPayload(
      createOperationDescriptor(getRequest(PlainQuery), {}),
      {me: {id: '4', __typename: 'User', name: 'Mark'}},
    );

    function Subscriber(): React.Node {
      const data = useLazyLoadQuery<{}, $FlowFixMe>(
        PlainQuery,
        {},
        {fetchPolicy: 'store-only'},
      );
      return data.me?.name ?? 'no name';
    }

    function Name(): React.Node {
      const data = useQueryFromServer(PlainQuery, queryRef);
      return data.me?.name ?? 'no name';
    }

    const renderer = TestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Loading">
          <Subscriber />
          <Name />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );
    await TestRenderer.act(async () => {});

    // Should be ['Zuck', 'Zuck']. The hook publishes without notifying and
    // nothing else drives this environment, so the subscriber is left holding
    // the snapshot it read before the publish — two components, one store, two
    // different answers.
    expect(renderer.toJSON()).toEqual(['Mark', 'Zuck']);
  });
});
