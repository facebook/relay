/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 * @jest-environment jsdom
 */

'use strict';

const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {Suspense, act} = require('react');
const {
  RelayEnvironmentProvider,
  graphql,
  useLazyLoadQuery,
  usePaginationFragment,
} = require('react-relay');
const {createMockEnvironment} = require('relay-test-utils');

test('@catch does not interfere with the hasNext value returned by usePaginationFragment', async () => {
  const QUERY = graphql`
    query usePaginationFragmentCatchTestQuery($first: Int, $after: ID) {
      me {
        ...usePaginationFragmentCatchTestFragment
      }
    }
  `;

  function MyComponent() {
    const query = useLazyLoadQuery(QUERY, {});

    const {hasNext} = usePaginationFragment(
      graphql`
        fragment usePaginationFragmentCatchTestFragment on User
        @refetchable(
          queryName: "usePaginationFragmentCatchTestRefetchableFragmentQuery"
        ) {
          friends(after: $after, first: $first)
            @connection(key: "UserFragment_friends")
            @catch {
            edges {
              node {
                __typename
              }
            }
          }
        }
      `,
      query.me,
    );

    return hasNext
      ? 'Connection has more items'
      : 'Connection has NO more items';
  }

  const environment = createMockEnvironment({});
  function App() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Loading...">
          <MyComponent />
        </Suspense>
      </RelayEnvironmentProvider>
    );
  }

  let container = null;
  await act(async () => {
    container = ReactTestingLibrary.render(<App />);
  });

  expect(container?.container.textContent).toEqual('Loading...');

  await act(async () => {
    environment.mock.resolveMostRecentOperation({
      data: {
        me: {
          id: '4',
          __typename: 'User',
          name: 'Jordan',
          friends: {
            edges: [
              {
                __typename: 'FiendEdge',
                cursor: 'cursor:0',
                node: {
                  id: '8',
                  __typename: 'User',
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:1',
              hasNextPage: true,
            },
          },
        },
      },
    });
  });

  expect(container?.container.textContent).toBe('Connection has more items');
});
