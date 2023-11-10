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

import type {DataID, LogEvent} from 'relay-runtime';
import type {RelayMockEnvironment} from 'relay-test-utils';

const invariant = require('invariant');
const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment: useFragment_LEGACY,
} = require('react-relay');
const useFragment_EXPERIMENTAL = require('react-relay/relay-hooks/experimental/useFragment_EXPERIMENTAL');
const TestRenderer = require('react-test-renderer');
const {
  __internal,
  Environment,
  Network,
  RecordSource,
  RelayFeatureFlags,
  graphql,
} = require('relay-runtime');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore');
const {createMockEnvironment} = require('relay-test-utils');

/**
 * CLIENT EDGE TO LIVE STRONG CLIENT OBJECT
 */

/**
 * @RelayResolver Query.edge_to_live_object_does_not_exist: TodoModel
 */
export function edge_to_live_object_does_not_exist(): {id: DataID} {
  return {id: 'THERE_IS_NO_TODO_WITH_THIS_ID'};
}

/**
 * CLIENT EDGE TO WEAK CLIENT OBJECT
 */

/**
 * @RelayResolver WeakModel
 * @weak
 */
export type WeakModel = {
  firstName: string,
  lastName: string,
};

/**
 * @RelayResolver Query.edge_to_null_weak_model: WeakModel
 */
export function edge_to_null_weak_model(): ?WeakModel {
  return null;
}

/**
 * @RelayResolver WeakModel.first_name: String
 */
export function first_name(model: WeakModel): string {
  return model.firstName;
}

/**
 * CLIENT EDGE TO STRONG CLIENT OBJECT
 */

type StrongModelType = ?{
  id: string,
  name: string,
};

/**
 * @RelayResolver StrongModel
 */
export function StrongModel(id: string): StrongModelType {
  return null;
}

/**
 * @RelayResolver StrongModel.name: String
 */
export function name(model: StrongModelType): ?string {
  return model?.name;
}

/**
 * @RelayResolver Query.edge_to_strong_model_does_not_exist: StrongModel
 */
export function edge_to_strong_model_does_not_exist(): {id: DataID} {
  return {id: 'THERE_IS_NO_STRONG_MODEL_WITH_THIS_ID'};
}

/**
 * CLIENT EDGE TO SERVER OBJECT
 */

/**
 * @RelayResolver Query.edge_to_server_object_does_not_exist: Comment
 */
export function edge_to_server_object_does_not_exist(): {id: DataID} {
  return {id: 'THERE_IS_NO_COMMENT_WITH_THIS_ID'};
}

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

const logEvents: Array<LogEvent> = [];
function logFn(event: LogEvent): void {
  logEvents.push(event);
}

function createEnvironment() {
  return new Environment({
    network: Network.create(jest.fn()),
    store: new LiveResolverStore(RecordSource.create(), {
      log: logFn,
    }),
    log: logFn,
  });
}

function EnvironmentWrapper({
  children,
  environment,
}: {
  children: React.Node,
  environment: Environment | RelayMockEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

describe.each([
  ['Experimental', useFragment_EXPERIMENTAL],
  ['Legacy', useFragment_LEGACY],
])('Hook implementation: %s', (_hookName, useFragment) => {
  let environment;
  beforeEach(() => {
    environment = createEnvironment();
  });
  test('client edge to ID with no corresponding live object', () => {
    function TodoNullComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverNullableModelClientEdgeTest_LiveModel_Query {
            edge_to_live_object_does_not_exist {
              id
              fancy_description {
                text
              }
            }
          }
        `,
        {},
      );

      invariant(data != null, 'Query response should be nonnull');

      switch (data.edge_to_live_object_does_not_exist) {
        case null:
          return 'Todo was null';
        case undefined:
          return 'Todo was undefined';
        default:
          return 'Todo was not null or undefined';
      }
    }
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoNullComponent />
      </EnvironmentWrapper>,
    );
    // TODO: T162471299 this should be 'Todo was null'
    expect(renderer.toJSON()).toEqual('Todo was not null or undefined');
  });

  test('client edge to ID with no corresponding weak object', () => {
    function NullWeakModelComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverNullableModelClientEdgeTest_WeakModel_Query {
            edge_to_null_weak_model {
              first_name
            }
          }
        `,
        {},
      );

      invariant(data != null, 'Query response should be nonnull');

      switch (data.edge_to_null_weak_model) {
        case null:
          return 'Weak model was null';
        case undefined:
          return 'Weak model was undefined';
        default:
          return 'Weak model was not null or undefined';
      }
    }
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NullWeakModelComponent />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Weak model was null');
  });

  test('client edge to ID with no corresponding strong object', () => {
    function NullStrongModelComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverNullableModelClientEdgeTest_StrongModel_Query {
            edge_to_strong_model_does_not_exist {
              name
            }
          }
        `,
        {},
      );

      invariant(data != null, 'Query response should be nonnull');

      switch (data.edge_to_strong_model_does_not_exist) {
        case null:
          return 'strong model was null';
        case undefined:
          return 'strong model was undefined';
        default:
          return 'strong model was not null or undefined';
      }
    }
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NullStrongModelComponent />
      </EnvironmentWrapper>,
    );
    // TODO: T162471299 this should be 'strong model was null'
    expect(renderer.toJSON()).toEqual('strong model was not null or undefined');
  });

  test('client edge to server ID with no corresponding server object', () => {
    function NullServerObjectComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverNullableModelClientEdgeTest_ServerObject_Query {
            edge_to_server_object_does_not_exist @waterfall {
              name
            }
          }
        `,
        {},
      );

      invariant(data != null, 'Query response should be nonnull');

      switch (data.edge_to_server_object_does_not_exist) {
        case null:
          return 'server object was null';
        case undefined:
          return 'server object was undefined';
        default:
          return 'server object was not null or undefined';
      }
    }
    const mock_environment = createMockEnvironment();
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={mock_environment}>
        <NullServerObjectComponent />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Loading...');
    TestRenderer.act(() => {
      mock_environment.mock.resolveMostRecentOperation({data: {node: null}});
      jest.runAllImmediates();
    });
    // TODO T169274655 should this be 'server object was null'?
    expect(renderer.toJSON()).toEqual('server object was undefined');
  });

  test('client edge to server ID with no corresponding server object (read only id)', () => {
    function NullServerObjectComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query {
            edge_to_server_object_does_not_exist @waterfall {
              id
            }
          }
        `,
        {},
      );

      invariant(data != null, 'Query response should be nonnull');

      switch (data.edge_to_server_object_does_not_exist) {
        case null:
          return 'server object was null';
        case undefined:
          return 'server object was undefined';
        default:
          return 'server object was not null or undefined';
      }
    }
    const mock_environment = createMockEnvironment();
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={mock_environment}>
        <NullServerObjectComponent />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Loading...');
    TestRenderer.act(() => {
      mock_environment.mock.resolveMostRecentOperation({data: {node: null}});
      jest.runAllImmediates();
    });
    // TODO T169274655 should this be 'server object was null'?
    expect(renderer.toJSON()).toEqual('server object was undefined');
  });
});
