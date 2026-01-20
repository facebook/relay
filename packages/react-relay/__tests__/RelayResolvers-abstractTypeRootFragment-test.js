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

import type {IEnvironment} from 'relay-runtime';

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {createMockEnvironment} = require('relay-test-utils');
const {
  disallowConsoleErrors,
  disallowWarnings,
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();
disallowConsoleErrors();

function EnvironmentWrapper({
  children,
  environment,
}: {
  children: React.Node,
  environment: IEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

function NodeGreeting() {
  const data = useLazyLoadQuery(
    graphql`
      query RelayResolversAbstractTypeRootFragmentTestQuery {
        node(id: "4") {
          node_greeting
        }
      }
    `,
    {},
  );
  return data.node?.node_greeting;
}

// https://github.com/facebook/relay/issues/4943#issuecomment-3221637018
test('Can read a resolver with a rootFragment on an abstract type', async () => {
  const logEvents = [];
  const environment = createMockEnvironment({
    relayFieldLogger(event) {
      logEvents.push(event);
    },
  });
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NodeGreeting />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Loading...');
  expect(logEvents).toEqual([]);

  await TestRenderer.act(() => {
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          __isNode: 'User',
          id: '4',
        },
      },
    });
    jest.runAllImmediates();
  });

  expect(logEvents).toEqual([]);
  expect(renderer?.toJSON()).toEqual('Hello Node with id 4!');
});
