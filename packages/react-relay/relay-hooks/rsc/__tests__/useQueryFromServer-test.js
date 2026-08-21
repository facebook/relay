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
  graphql,
} = require('relay-runtime');
const {
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();

// `@connection` is the interesting part: it compiles to a LinkedHandle, and
// normalization turns a handle into a field payload rather than a record.
// `useQueryFromServer` publishes the normalized source and nothing else, so the
// record the handle stands for is never created and the store cannot answer the
// query — even though the response is sitting right there in the ref.
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

const SERVER_RESPONSE = {
  node: {
    __typename: 'Feedback',
    id: '<feedbackid>',
    comments: {
      edges: [
        {cursor: 'cursor-1', node: {__typename: 'Comment', id: 'node-1'}},
      ],
      pageInfo: {hasNextPage: false, endCursor: 'cursor-1'},
    },
  },
};

let environment;
let fetch;

/**
 * Preload on a *server* environment, exactly as an RSC render does. Only the
 * returned ref crosses to the client — the store this populated, handle records
 * and all, does not.
 */
function serverQueryRef() {
  const serverEnvironment = new Environment({
    // $FlowFixMe[invalid-tuple-arity]
    network: Network.create(() => Observable.from({data: SERVER_RESPONSE})),
    store: new Store(new RecordSource()),
    isServer: true,
  });
  return serverPreloadQuery(serverEnvironment, ConnectionQuery, {
    id: '<feedbackid>',
  });
}

function Comments(props: any) {
  const data = useQueryFromServer(ConnectionQuery, props.queryRef);
  return (data.node?.comments?.edges ?? [])
    .map(edge => edge?.node?.id)
    .join(',');
}

async function renderWithServerPayload() {
  const renderer = TestRenderer.create(
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading">
        <Comments queryRef={serverQueryRef()} />
      </React.Suspense>
    </RelayEnvironmentProvider>,
  );
  // Let `use(queryRef._response)` settle and the tree re-render.
  await TestRenderer.act(async () => {});
  return renderer;
}

describe('useQueryFromServer with a @connection', () => {
  beforeEach(() => {
    // Never emits. A fetch here is already the bug: whatever this hook did with
    // the server's response, it did not leave the store able to answer the
    // query it was given.
    fetch = jest.fn(() => Observable.create<GraphQLResponse>(() => {}));
    environment = new Environment({
      // $FlowFixMe[invalid-tuple-arity]
      network: Network.create(fetch),
      store: new Store(new RecordSource()),
    });
  });

  it('BUG: suspends rather than rendering the payload it was handed', async () => {
    const renderer = await renderWithServerPayload();

    // Should be 'node-1'. The connection record is missing, so the read comes
    // up short and Relay suspends on a fetch that will never resolve.
    expect(renderer.toJSON()).toEqual('Loading');
  });

  it('BUG: refetches data the server already sent', async () => {
    await renderWithServerPayload();

    // Should be 0. The whole point of preloading on the server is not to make
    // this request.
    expect(fetch).toBeCalledTimes(1);
  });
});
