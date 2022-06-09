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

import type {
  FetchFunction,
  FetchPolicy,
  IEnvironment,
  MutableRecordSource,
} from 'relay-runtime';

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {
  Environment,
  Network,
  RecordSource,
  Store,
  commitLocalUpdate,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

function createEnvironment(
  source: MutableRecordSource,
  fetchFn: FetchFunction,
) {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(source),
  });
}

describe('Client Only Queries', () => {
  let renderer;
  let environment: IEnvironment;

  const query = graphql`
    query ClientOnlyQueriesTest1Query {
      defaultSettings {
        client_field
      }
    }
  `;
  const variables = {};
  const operation = createOperationDescriptor(query, variables);

  function InnerTestComponent(props: {|fetchPolicy?: FetchPolicy|}) {
    const data = useLazyLoadQuery(query, variables, {
      fetchPolicy: props.fetchPolicy ?? 'store-only',
    });
    return data.defaultSettings?.client_field ?? 'MISSING';
  }

  function TestComponent({
    environment: relayEnvironment,
    ...rest
  }: {|
    environment: IEnvironment,
    fetchPolicy?: FetchPolicy,
  |}) {
    return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  beforeEach(() => {
    environment = createEnvironment(RecordSource.create(), () => {
      const error = new Error('Unexpected Network Error');
      throw error;
    });

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} />,
      );
    });
  });

  it('should render missing data', () => {
    expect(renderer.toJSON()).toEqual('MISSING');
  });

  it('should render data from the store', () => {
    TestRenderer.act(() => {
      environment.commitPayload(operation, {
        defaultSettings: {
          client_field: 'My Client Field',
        },
      });
    });
    expect(renderer.toJSON()).toEqual('My Client Field');
  });

  it('should render with new environment', () => {
    environment = createEnvironment(
      RecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          defaultSettings: {__ref: 'client:defaultSettings'},
        },
        'client:defaultSettings': {
          __id: 'client:defaultSettings',
          client_field: 'Another Client Field',
        },
      }),
      () => {
        throw new Error();
      },
    );
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent environment={environment} />,
      );
    });

    expect(renderer.toJSON()).toEqual('Another Client Field');
  });

  it.each(['store-or-network', 'store-and-network', 'network-only'])(
    'should throw on network request, fetchPolicy: `%s`',
    fetchPolicy => {
      expect(() =>
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <TestComponent
              environment={environment}
              fetchPolicy={(fetchPolicy: $FlowFixMe)}
            />,
          );
        }),
      ).toThrow(new Error('Unexpected Network Error'));
    },
  );

  it('should still render with store-or-network', () => {
    environment = createEnvironment(
      RecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          defaultSettings: {__ref: 'client:defaultSettings'},
        },
        'client:defaultSettings': {
          __id: 'client:defaultSettings',
          client_field: 'Another Client Field',
        },
      }),
      () => {
        throw new Error();
      },
    );
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <TestComponent
          environment={environment}
          fetchPolicy="store-or-network"
        />,
      );
    });
    expect(renderer.toJSON()).toEqual('Another Client Field');
  });

  it('should handle updatable client-only query', () => {
    const updatableQuery = graphql`
      query ClientOnlyQueriesTestUpdatableQuery @updatable {
        defaultSettings {
          client_field
        }
      }
    `;
    TestRenderer.act(() => {
      commitLocalUpdate(environment, store => {
        const root = store.getRoot();
        const settingsID = 'client:defaultSettings';
        const settings = store.create(settingsID, 'Settings');
        root.setLinkedRecord(settings, 'defaultSettings');

        const updatableData = store.readUpdatableQuery_EXPERIMENTAL(
          updatableQuery,
          {},
        ).updatableData;
        const defaultSettings = updatableData.defaultSettings;
        if (defaultSettings != null) {
          defaultSettings.client_field =
            'Set with readUpdatableQuery_EXPERIMENTAL';
        } else {
          throw new Error('Expected `defaultSettings` to be defined.');
        }
      });
    });

    expect(renderer.toJSON()).toEqual(
      'Set with readUpdatableQuery_EXPERIMENTAL',
    );
  });
});
