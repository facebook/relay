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
import type {MutableRecordSource} from 'relay-runtime/store/RelayStoreTypes';
import type {RelayFieldLoggerEvent} from 'relay-runtime/store/RelayStoreTypes';

const useFragmentOriginal_EXPERIMENTAL = require('../experimental/useFragment_EXPERIMENTAL');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useFragmentOriginal_LEGACY = require('../useFragment');
const useLazyLoadQuery = require('../useLazyLoadQuery');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {graphql} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe.each([
  ['Experimental', useFragmentOriginal_EXPERIMENTAL],
  ['Legacy', useFragmentOriginal_LEGACY],
])('useFragment (%s)', (_hookName, useFragmentOriginal) => {
  test('@required(action: LOG) gets logged even if no data is "missing"', () => {
    function InnerTestComponent({id}: {id: string}) {
      const data = useLazyLoadQuery(
        graphql`
          query useFragmentWithRequiredTestQuery($id: ID!) {
            node(id: $id) {
              ... on User {
                ...useFragmentWithRequiredTestUserFragment
              }
            }
          }
        `,
        {id},
        {fetchPolicy: 'store-only'},
      );
      const user = useFragmentOriginal(
        graphql`
          fragment useFragmentWithRequiredTestUserFragment on User {
            name @required(action: LOG)
          }
        `,
        data.node,
      );
      return `${user?.name ?? 'Unknown name'}`;
    }

    function TestComponent({
      environment,
      ...rest
    }: {
      environment: RelayModernEnvironment,
      id: string,
    }) {
      return (
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="Loading...">
            <InnerTestComponent {...rest} />
          </React.Suspense>
        </RelayEnvironmentProvider>
      );
    }
    const relayFieldLogger = jest.fn<
      $FlowFixMe | [RelayFieldLoggerEvent],
      void,
    >();
    function createEnvironment(source: MutableRecordSource) {
      return new RelayModernEnvironment({
        network: RelayNetwork.create(jest.fn()),
        store: new LiveResolverStore(source),
        relayFieldLogger,
      });
    }

    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"1")': {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        name: null,
      },
    });
    const environment = createEnvironment(source);

    const renderer = TestRenderer.create(
      <TestComponent environment={environment} id="1" />,
    );

    // Validate that the missing required field was logged.
    expect(relayFieldLogger.mock.calls).toEqual([
      [
        {
          fieldPath: 'name',
          kind: 'missing_field.log',
          owner: 'useFragmentWithRequiredTestUserFragment',
        },
      ],
    ]);
    expect(renderer.toJSON()).toEqual('Unknown name');
  });
});
