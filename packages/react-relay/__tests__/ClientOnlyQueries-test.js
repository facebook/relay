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

import type {
  FetchFunction,
  FetchPolicy,
  IEnvironment,
  MutableRecordSource,
} from 'relay-runtime';

const React = require('react');
const {RelayEnvironmentProvider, useClientQuery} = require('react-relay');
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

describe('Client-only queries', () => {
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

  function InnerTestComponent() {
    const data = useClientQuery(query, variables);
    return data.defaultSettings?.client_field ?? 'MISSING';
  }

  function TestComponent({
    environment: relayEnvironment,
    ...rest
  }: {
    environment: IEnvironment,
    fetchPolicy?: FetchPolicy,
  }) {
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

        const updatableData = store.readUpdatableQuery(
          updatableQuery,
          {},
        ).updatableData;
        const defaultSettings = updatableData.defaultSettings;
        if (defaultSettings != null) {
          defaultSettings.client_field = 'Set with readUpdatableQuery';
        } else {
          throw new Error('Expected `defaultSettings` to be defined.');
        }
      });
    });

    expect(renderer.toJSON()).toEqual('Set with readUpdatableQuery');
  });
});

test('hello-world query', () => {
  const environment = createEnvironment(RecordSource.create(), () => {
    const error = new Error('Unexpected Network Error');
    throw error;
  });

  function InnerTestComponent() {
    const data = useClientQuery(
      graphql`
        query ClientOnlyQueriesTest2Query {
          hello(world: "World")
        }
      `,
      {},
    );
    return data.hello ?? 'MISSING';
  }

  function TestComponent({
    environment: relayEnvironment,
    ...rest
  }: {
    environment: IEnvironment,
    fetchPolicy?: FetchPolicy,
  }) {
    return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <TestComponent
        environment={environment}
        fetchPolicy="store-or-network"
      />,
    );
  });

  expect(renderer?.toJSON()).toBe('Hello, World!');
});

test('hello user query with client-edge query', () => {
  const environment = createEnvironment(
    RecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node(id:"4")': {__ref: '4'},
      },
      '4': {
        id: '4',
        __id: '4',
        name: 'Alice',
      },
    }),
    () => {
      const error = new Error('Unexpected Network Error');
      throw error;
    },
  );

  function InnerTestComponent() {
    const data = useClientQuery(
      graphql`
        query ClientOnlyQueriesTest3Query {
          hello_user(id: "4") @waterfall {
            name
          }
        }
      `,
      {},
    );
    return `Hello, ${data.hello_user?.name ?? 'MISSING'}!`;
  }

  function TestComponent({
    environment: relayEnvironment,
    ...rest
  }: {
    environment: IEnvironment,
    fetchPolicy?: FetchPolicy,
  }) {
    return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <React.Suspense fallback="Loading...">
          <InnerTestComponent {...rest} />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <TestComponent
        environment={environment}
        fetchPolicy="store-or-network"
      />,
    );
  });

  expect(renderer?.toJSON()).toBe('Hello, Alice!');
});
