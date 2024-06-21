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

import type {LogEvent} from '../../relay-runtime/store/RelayStoreTypes';
import type {RelayResolverModelTestFragment$key} from './__generated__/RelayResolverModelTestFragment.graphql';
import type {RelayResolverModelTestInterfaceFragment$key} from './__generated__/RelayResolverModelTestInterfaceFragment.graphql';
import type {RelayResolverModelTestWithPluralFragment$key} from './__generated__/RelayResolverModelTestWithPluralFragment.graphql';

const React = require('react');
const {
  RelayEnvironmentProvider,
  useClientQuery,
  useFragment: useFragment_LEGACY,
  useLazyLoadQuery: useLazyLoadQuery_LEGACY,
} = require('react-relay');
const useFragment_REACT_CACHE = require('react-relay/relay-hooks/react-cache/useFragment_REACT_CACHE');
const useLazyLoadQuery_REACT_CACHE = require('react-relay/relay-hooks/react-cache/useLazyLoadQuery_REACT_CACHE');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  addTodo,
  completeTodo,
  resetStore,
} = require('relay-runtime/store/__tests__/resolvers/ExampleTodoStore');
const LiveResolverStore = require('relay-runtime/store/experimental-live-resolvers/LiveResolverStore.js');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

let logEvents: Array<LogEvent> = [];
function logFn(event: LogEvent): void {
  logEvents.push(event);
}

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = true;
  logEvents = [];
  resetStore(logFn);
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
  RelayFeatureFlags.ENABLE_CLIENT_EDGES = false;
});

function createEnvironment() {
  return new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store: new LiveResolverStore(RelayRecordSource.create(), {
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
  environment: RelayModernEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

describe.each([
  ['React Cache', useLazyLoadQuery_REACT_CACHE, useFragment_REACT_CACHE],
  ['Legacy', useLazyLoadQuery_LEGACY, useFragment_LEGACY],
])('Hook implementation: %s', (_hookName, useLazyLoadQuery, useFragment) => {
  const usingReactCache = useLazyLoadQuery === useLazyLoadQuery_REACT_CACHE;
  // Our open-source build is still on React 17, so we need to skip these tests there:
  if (usingReactCache) {
    // $FlowExpectedError[prop-missing] Cache not yet part of Flow types
    if (React.unstable_getCacheForType === undefined) {
      return;
    }
  }
  let environment;
  beforeEach(() => {
    RelayFeatureFlags.USE_REACT_CACHE = usingReactCache;
    environment = createEnvironment();
  });

  function TodoComponent(props: {
    fragmentKey: ?RelayResolverModelTestFragment$key,
  }) {
    const data = useFragment(
      graphql`
        fragment RelayResolverModelTestFragment on TodoModel {
          id
          fancy_description {
            text
            color
          }
        }
      `,
      props.fragmentKey,
    );
    if (data == null) {
      return null;
    }

    // TODO: The `__relay_model_instance` will be hidden from the
    // users and impossible to select.
    return `${data.fancy_description?.text ?? 'unknown'} - ${
      data.fancy_description?.color ?? 'unknown'
    }`;
  }

  function TodoRootComponent(props: {todoID: string}) {
    const data = useClientQuery(
      graphql`
        query RelayResolverModelTestTodoQuery($id: ID!) {
          todo_model(todoID: $id) {
            ...RelayResolverModelTestFragment
          }
        }
      `,
      {id: props.todoID},
    );
    if (data?.todo_model == null) {
      return null;
    }

    return <TodoComponent fragmentKey={data?.todo_model} />;
  }

  test('should read title of the model', () => {
    addTodo('Test todo');

    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoRootComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Test todo - red');
  });

  test('should render `null` model.', () => {
    function TodoNullComponent() {
      const data = useClientQuery(
        graphql`
          query RelayResolverModelTestTodoNullQuery {
            todo_model_null {
              id
            }
          }
        `,
        {},
      );
      if (data?.todo_model_null == null) {
        return null;
      }

      return data?.todo_model_null.id;
    }
    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoNullComponent />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual(null);
  });

  test('read plural resolver field', () => {
    function TodoComponentWithPluralResolverComponent(props: {todoID: string}) {
      const data = useClientQuery(
        graphql`
          query RelayResolverModelTestTodoWithPluralFieldQuery($id: ID!) {
            todo_model(todoID: $id) {
              ...RelayResolverModelTestWithPluralFragment
            }
          }
        `,
        {id: props.todoID},
      );
      if (data?.todo_model == null) {
        return null;
      }

      return (
        <TodoComponentWithPluralDescription fragmentKey={data.todo_model} />
      );
    }

    function TodoComponentWithPluralDescription(props: {
      fragmentKey: ?RelayResolverModelTestWithPluralFragment$key,
    }) {
      const data = useFragment(
        graphql`
          fragment RelayResolverModelTestWithPluralFragment on TodoModel {
            many_fancy_descriptions {
              text
              color
            }
          }
        `,
        props.fragmentKey,
      );
      if (data == null) {
        return null;
      }

      return data.many_fancy_descriptions
        ?.map(
          item => `${item?.text ?? 'unknown'} - ${item?.color ?? 'unknown'}`,
        )
        .join(',');
    }

    addTodo('Test todo');

    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoComponentWithPluralResolverComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Test todo - red');
  });

  test('read live @weak resolver field', () => {
    function TodoComponentWithPluralResolverComponent(props: {todoID: string}) {
      const data = useClientQuery(
        graphql`
          query RelayResolverModelTestWeakLiveFieldQuery($id: ID!) {
            live_todo_description(todoID: $id) {
              text
              color
            }
          }
        `,
        {id: props.todoID},
      );
      if (data?.live_todo_description == null) {
        return null;
      }

      return `${data.live_todo_description?.text ?? 'unknown'} - ${
        data.live_todo_description?.color ?? 'unknown'
      }`;
    }

    addTodo('Test todo');

    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoComponentWithPluralResolverComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
    expect(renderer.toJSON()).toEqual('Test todo - red');

    TestRenderer.act(() => {
      completeTodo('todo-1');
      jest.runAllImmediates();
    });
    expect(renderer.toJSON()).toEqual('Test todo - green');
  });

  test('read interface field', () => {
    function TodoComponentWithInterfaceComponent(props: {todoID: string}) {
      const data = useClientQuery(
        graphql`
          query RelayResolverModelTestTodoWithInterfaceQuery($id: ID!) {
            todo_model(todoID: $id) {
              ...RelayResolverModelTestInterfaceFragment
            }
          }
        `,
        {id: props.todoID},
      );
      if (data?.todo_model == null) {
        return null;
      }

      return <TodoComponentWithInterface fragmentKey={data.todo_model} />;
    }

    function TodoComponentWithInterface(props: {
      fragmentKey: ?RelayResolverModelTestInterfaceFragment$key,
    }) {
      const data = useFragment(
        graphql`
          fragment RelayResolverModelTestInterfaceFragment on TodoModel {
            fancy_description {
              some_interface {
                __typename
                description
              }
              some_client_type_with_interface {
                client_interface {
                  __typename
                  description
                }
              }
            }
          }
        `,
        props.fragmentKey,
      );
      return JSON.stringify(data);
    }

    addTodo('Test todo');

    const renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoComponentWithInterfaceComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
    // $FlowFixMe[incompatible-call] Yes, it is compatible...
    const response = JSON.parse(renderer.toJSON() ?? '{}');
    jest.runAllImmediates();

    // This incorrectly currently reads out just the typename from resolvers which
    // return interface fields
    expect(response.fancy_description?.some_interface).toEqual({
      __typename: 'ClientTypeImplementingClientInterface',
      description: 'It was a magical place',
    });

    // However, for resolvers which return objects that contain interface fields,
    // we correctly read out the data.
    expect(
      response?.fancy_description?.some_client_type_with_interface,
    ).toEqual({
      client_interface: {
        __typename: 'ClientTypeImplementingClientInterface',
        description: 'It was a magical place',
      },
    });
  });
});
