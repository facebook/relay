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
const {RelayEnvironmentProvider, useClientQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {
  __internal,
  Environment,
  Network,
  RecordSource,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  addTodo,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const {createMockEnvironment} = require('relay-test-utils');
const {
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();

/**
 * CLIENT EDGE TO PLURAL LIVE STRONG CLIENT OBJECT
 */

/**
 * @RelayResolver Query.edge_to_plural_live_objects_some_exist: [TodoModel]
 */
export function edge_to_plural_live_objects_some_exist(): ReadonlyArray<{
  id: DataID,
}> {
  return [{id: 'todo-1'}, {id: 'THERE_IS_NO_TODO_WITH_THIS_ID'}];
}

/**
 * @RelayResolver Query.edge_to_plural_live_objects_none_exist: [TodoModel]
 */
export function edge_to_plural_live_objects_none_exist(): ReadonlyArray<{
  id: DataID,
}> {
  return [{id: 'NO_TODO_1'}, {id: 'NO_TODO_2'}];
}

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

/**
 * ERROR CASES
 */

const ERROR_ID = 'error';
const ERROR_MESSAGE = `IDs containing ${ERROR_ID} will cause an error to be thrown`;

type ErrorModelType = ?{
  id: string,
};

/**
 * @RelayResolver ErrorModel
 */
export function ErrorModel(id: string): ErrorModelType {
  if (!id.includes(ERROR_ID)) {
    return {id};
  }
  throw new Error(ERROR_MESSAGE);
}

/**
 * @RelayResolver Query.edge_to_model_that_throws: ErrorModel
 */
export function edge_to_model_that_throws(): {id: DataID} {
  return {id: ERROR_ID};
}

/**
 * @RelayResolver Query.edge_to_plural_models_that_throw: [ErrorModel]
 */
export function edge_to_plural_models_that_throw(): ReadonlyArray<{
  id: DataID,
}> {
  return [{id: `${ERROR_ID}-1`}, {id: `${ERROR_ID}-2`}];
}

/**
 * @RelayResolver Query.edge_to_plural_models_some_throw: [ErrorModel]
 */
export function edge_to_plural_models_some_throw(): ReadonlyArray<{
  id: DataID,
}> {
  return [{id: ERROR_ID}, {id: 'a valid id!'}];
}

const logEvents: Array<LogEvent> = [];
function logFn(event: LogEvent): void {
  logEvents.push(event);
}

function createEnvironment() {
  return new Environment({
    network: Network.create(jest.fn()),
    store: new RelayModernStore(RecordSource.create(), {
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

let environment;
beforeEach(() => {
  environment = createEnvironment();
});

test('client edge to plural IDs, none have corresponding live object', () => {
  function TodoNullComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query {
          edge_to_plural_live_objects_none_exist {
            id
            description
          }
        }
      `,
      {},
    );

    invariant(data != null, 'Query response should be nonnull');
    expect(data.edge_to_plural_live_objects_none_exist).toHaveLength(2);
    return data.edge_to_plural_live_objects_none_exist
      ?.map(item =>
        item
          ? `${item.id ?? 'unknown'} - ${item.description ?? 'unknown'}`
          : 'unknown',
      )
      .join(',');
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoNullComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('unknown,unknown');
});

test('client edge to plural IDs, some with no corresponding live object', () => {
  function TodoNullComponent() {
    const data = useClientQuery(
      graphql`
        query RelayResolverNullableModelClientEdgeTest_PluralLiveModel_Query {
          edge_to_plural_live_objects_some_exist {
            id
            description
          }
        }
      `,
      {},
    );

    invariant(data != null, 'Query response should be nonnull');
    expect(data.edge_to_plural_live_objects_some_exist).toHaveLength(2);
    return data.edge_to_plural_live_objects_some_exist
      ?.map(item =>
        item
          ? `${item.id ?? 'unknown'} - ${item.description ?? 'unknown'}`
          : 'unknown',
      )
      .join(',');
  }

  addTodo('Test todo');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoNullComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('todo-1 - Test todo,unknown');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoNullComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Todo was null');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NullWeakModelComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Weak model was null');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <NullStrongModelComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('strong model was null');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={mock_environment}>
        <NullServerObjectComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Loading...');
  TestRenderer.act(() => {
    mock_environment.mock.resolveMostRecentOperation({data: {node: null}});
    jest.runAllImmediates();
  });
  // TODO T169274655 should this be 'server object was null'?
  expect(renderer?.toJSON()).toEqual('server object was undefined');
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
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={mock_environment}>
        <NullServerObjectComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Loading...');
  TestRenderer.act(() => {
    mock_environment.mock.resolveMostRecentOperation({data: {node: null}});
    jest.runAllImmediates();
  });
  // TODO T169274655 should this be 'server object was null'?
  expect(renderer?.toJSON()).toEqual('server object was undefined');
});

test('Errors thrown when reading the model a client edge points to are caught as resolver errors', () => {
  const operation = createOperationDescriptor(
    graphql`
      query RelayResolverNullableModelClientEdgeTest_ErrorModel_Query {
        edge_to_model_that_throws {
          __typename
        }
      }
    `,
    {},
  );
  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.fieldErrors).toEqual([
    {
      error: Error(ERROR_MESSAGE),
      owner: 'RelayResolverNullableModelClientEdgeTest_ErrorModel_Query',
      fieldPath: 'edge_to_model_that_throws.__relay_model_instance',
      kind: 'relay_resolver.error',
      shouldThrow: false,
      handled: false,
    },
  ]);
  const data: $FlowFixMe = snapshot.data;
  expect(data.edge_to_model_that_throws).toBe(null);
});

test('Errors thrown when reading plural client edge are caught as resolver errors', () => {
  const operation = createOperationDescriptor(
    graphql`
      query RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query {
        edge_to_plural_models_that_throw {
          __typename
        }
      }
    `,
    {},
  );
  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.fieldErrors).toEqual([
    {
      error: Error(ERROR_MESSAGE),
      owner: 'RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query',
      fieldPath: 'edge_to_plural_models_that_throw.__relay_model_instance',
      kind: 'relay_resolver.error',
      shouldThrow: false,
      handled: false,
    },
    {
      error: Error(ERROR_MESSAGE),
      owner: 'RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query',
      fieldPath: 'edge_to_plural_models_that_throw.__relay_model_instance',
      kind: 'relay_resolver.error',
      shouldThrow: false,
      handled: false,
    },
  ]);
  const data: $FlowFixMe = snapshot.data;
  expect(data.edge_to_plural_models_that_throw).toStrictEqual([null, null]);
});

test('Errors thrown when reading plural client edge are caught as resolver errors and valid data is returned', () => {
  const operation = createOperationDescriptor(
    graphql`
      query RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query {
        edge_to_plural_models_some_throw {
          id
        }
      }
    `,
    {},
  );
  const snapshot = environment.lookup(operation.fragment);
  expect(snapshot.fieldErrors).toEqual([
    {
      error: Error(ERROR_MESSAGE),
      owner:
        'RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query',
      fieldPath: 'edge_to_plural_models_some_throw.__relay_model_instance',
      kind: 'relay_resolver.error',
      shouldThrow: false,
      handled: false,
    },
  ]);
  const data: $FlowFixMe = snapshot.data;
  expect(data.edge_to_plural_models_some_throw).toStrictEqual([
    null,
    {id: 'a valid id!'},
  ]);
});
