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

import type {MutableRecordSource} from 'relay-runtime/store/RelayStoreTypes';
import type {RelayFieldLoggerEvent} from 'relay-runtime/store/RelayStoreTypes';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useFragment = require('../useFragment');
const useLazyLoadQuery = require('../useLazyLoadQuery');
const ReactTestingLibrary = require('@testing-library/react');
const React = require('react');
const {act} = require('react');
const {graphql} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

test('@required(action: LOG) gets logged even if no data is "missing"', async () => {
  function InnerTestComponent({id}: {id: string}) {
    const data = useLazyLoadQuery(
      graphql`
        query useFragmentWithRequiredTestQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              ...useFragmentWithRequiredTestUserFragment
                @dangerously_unaliased_fixme
            }
          }
        }
      `,
      {id},
      {fetchPolicy: 'store-only'},
    );
    const user = useFragment(
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
      store: new RelayModernStore(source),
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

  let renderer;
  await act(() => {
    renderer = ReactTestingLibrary.render(
      <TestComponent environment={environment} id="1" />,
    );
  });

  // Validate that the missing required field was logged.
  expect(relayFieldLogger.mock.calls).toEqual([
    [
      {
        fieldPath: 'name',
        kind: 'missing_required_field.log',
        owner: 'useFragmentWithRequiredTestUserFragment',
      },
    ],
  ]);
  expect(renderer?.container.textContent).toEqual('Unknown name');
});
