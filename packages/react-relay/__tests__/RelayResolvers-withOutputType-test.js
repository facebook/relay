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
import type {RelayResolversWithOutputTypeTestFragment$key} from './__generated__/RelayResolversWithOutputTypeTestFragment.graphql';
import type {RelayResolversWithOutputTypeTestTextColorComponentFragment$key} from './__generated__/RelayResolversWithOutputTypeTestTextColorComponentFragment.graphql';
import type {RelayResolversWithOutputTypeTestTextStyleComponentFragment$key} from './__generated__/RelayResolversWithOutputTypeTestTextStyleComponentFragment.graphql';
import type {RelayResolversWithOutputTypeTestTodoCompleteFragment$key} from './__generated__/RelayResolversWithOutputTypeTestTodoCompleteFragment.graphql';

const React = require('react');
const {RelayEnvironmentProvider, useClientQuery} = require('react-relay');
const useFragment = require('react-relay/relay-hooks/useFragment');
const TestRenderer = require('react-test-renderer');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  addTodo,
  blockedBy,
  completeTodo,
  removeTodo,
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
  logEvents = [];
  resetStore(logFn);
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
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

let environment;
beforeEach(() => {
  environment = createEnvironment();
});

function TodoComponent(props: {
  fragmentKey: ?RelayResolversWithOutputTypeTestFragment$key,
}) {
  const data = useFragment(
    graphql`
      fragment RelayResolversWithOutputTypeTestFragment on Todo {
        text {
          content
          style {
            ...RelayResolversWithOutputTypeTestTextStyleComponentFragment
          }
        }
        ...RelayResolversWithOutputTypeTestTodoCompleteFragment
      }
    `,
    props.fragmentKey,
  );
  if (data == null) {
    return null;
  }

  return (
    <>
      {data.text?.content ?? 'no text'}
      <TodoCompleteComponent fragmentKey={data} />
      <TodoTextStyleComponent fragmentKey={data.text?.style} />
    </>
  );
}

function TodoCompleteComponent(props: {
  fragmentKey: ?RelayResolversWithOutputTypeTestTodoCompleteFragment$key,
}) {
  const data = useFragment(
    graphql`
      fragment RelayResolversWithOutputTypeTestTodoCompleteFragment on Todo {
        complete
      }
    `,
    props.fragmentKey,
  );
  let status = 'unknown';
  if (data?.complete != null) {
    status = data?.complete ? 'is completed' : 'is not completed';
  }
  return status;
}

function TodoTextStyleComponent(props: {
  fragmentKey: ?RelayResolversWithOutputTypeTestTextStyleComponentFragment$key,
}) {
  const data = useFragment(
    graphql`
      fragment RelayResolversWithOutputTypeTestTextStyleComponentFragment on TodoTextStyle {
        font_style
        color {
          ...RelayResolversWithOutputTypeTestTextColorComponentFragment
        }
      }
    `,
    props.fragmentKey,
  );
  if (data == null) {
    return 'unknown style';
  }
  return (
    <>
      {`style: ${data.font_style ?? 'unknown font style'}`}
      <TodoTextColorComponent fragmentKey={data?.color} />
    </>
  );
}

function TodoTextColorComponent(props: {
  fragmentKey: ?RelayResolversWithOutputTypeTestTextColorComponentFragment$key,
}) {
  const data = useFragment(
    graphql`
      fragment RelayResolversWithOutputTypeTestTextColorComponentFragment on TodoTextColor {
        human_readable_color
      }
    `,
    props.fragmentKey,
  );
  return `color: ${data?.human_readable_color ?? 'unknown color'}`;
}

function TodoListComponent() {
  const data = useClientQuery(
    graphql`
      query RelayResolversWithOutputTypeTestExceptionalProjectQuery {
        todos(first: 10) {
          edges {
            node {
              ...RelayResolversWithOutputTypeTestFragment
            }
          }
        }
      }
    `,
    {},
  );
  if (data.todos?.edges?.length === 0) {
    return 'No Items';
  }

  return data.todos?.edges?.map((edge, index) => {
    return <TodoComponent key={index} fragmentKey={edge?.node} />;
  });
}

function TodoRootComponent(props: {todoID: string}) {
  const data = useClientQuery(
    graphql`
      query RelayResolversWithOutputTypeTestTodoQuery($id: ID!) {
        todo(todoID: $id) {
          ...RelayResolversWithOutputTypeTestFragment
        }
      }
    `,
    {id: props.todoID},
  );
  if (data?.todo == null) {
    return null;
  }

  return <TodoComponent fragmentKey={data?.todo} />;
}

function TodoRootWithBlockedComponent(props: {todoID: string}) {
  const data = useClientQuery(
    graphql`
      query RelayResolversWithOutputTypeTestTodoWithBlockedQuery($id: ID!) {
        todo(todoID: $id) {
          blocked_by {
            ...RelayResolversWithOutputTypeTestFragment
          }
        }
      }
    `,
    {id: props.todoID},
  );
  if (data?.todo == null) {
    return null;
  }
  return data?.todo.blocked_by?.map((blocking_todo, index) => {
    return <TodoComponent fragmentKey={blocking_todo} key={index} />;
  });
}

function ManyTodosComponent(props: {todos: $ReadOnlyArray<?string>}) {
  const data = useClientQuery(
    graphql`
      query RelayResolversWithOutputTypeTestManyTodosQuery($todos: [ID]!) {
        many_todos(todo_ids: $todos) {
          ...RelayResolversWithOutputTypeTestFragment
        }
      }
    `,
    {
      todos: props.todos,
    },
  );
  if (data.many_todos?.length === 0) {
    return 'No Items';
  }

  return data.many_todos?.map((todo, index) => {
    return <TodoComponent key={index} fragmentKey={todo} />;
  });
}

function ManyLiveTodosComponent() {
  const data = useClientQuery(
    graphql`
      query RelayResolversWithOutputTypeTestManyLiveTodosQuery {
        many_live_todos {
          ...RelayResolversWithOutputTypeTestFragment
        }
      }
    `,
    {},
  );
  if (data.many_live_todos?.length === 0) {
    return 'No Items';
  }

  return data.many_live_todos?.map((todo, index) => {
    return <TodoComponent key={index} fragmentKey={todo} />;
  });
}

test('should render empty state', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('No Items');
});

test('add new item to the list', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
      </EnvironmentWrapper>,
    );
  });

  TestRenderer.act(() => {
    addTodo('My first todo');
    jest.runAllImmediates();
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  TestRenderer.act(() => {
    addTodo('My second todo');
    jest.runAllImmediates();
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});

test('complete todo', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
      </EnvironmentWrapper>,
    );
  });
  TestRenderer.act(() => {
    addTodo('My first todo');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  TestRenderer.act(() => {
    completeTodo('todo-1');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
  ]);
});

test('complete todo and add one more', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
      </EnvironmentWrapper>,
    );
  });
  TestRenderer.act(() => {
    addTodo('My first todo');
    completeTodo('todo-1');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
  ]);
  TestRenderer.act(() => {
    addTodo('My second todo');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
    'My second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});

test('query single todo item (item is missing)', () => {
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoRootComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toBe(null);
});

test('query single todo item (item is present) and complete it', () => {
  addTodo('My first todo');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoRootComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
  TestRenderer.act(() => {
    completeTodo('todo-1');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
  ]);
});

test('render both list and item component', () => {
  addTodo('My first todo');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
        <TodoRootComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  TestRenderer.act(() => {
    addTodo('Second todo');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  // complete the first item
  TestRenderer.act(() => {
    completeTodo('todo-1');
    jest.runAllImmediates();
  });
  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
    'Second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
  ]);
});

test('removes item', () => {
  addTodo('My first todo');
  addTodo('Second todo');
  completeTodo('todo-1');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
        <TodoRootComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
    'Second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My first todo',
    'is completed',
    'style: normal',
    'color: color is green',
  ]);

  TestRenderer.act(() => {
    removeTodo('todo-1');
    jest.runAllImmediates();
  });

  expect(renderer?.toJSON()).toEqual([
    'Second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});

test('renders after GC', () => {
  addTodo('My first todo');

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
      </EnvironmentWrapper>,
    );
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  (environment.getStore(): $FlowFixMe).__gc();
  jest.runAllTimers();

  expect(environment.getStore().getSource().toJSON()).toEqual({
    'client:root': {
      __id: 'client:root',
      __typename: '__Root',
      'todos(first:10)': {
        __ref: 'client:root:todos(first:10)',
      },
    },
    'client:root:todos(first:10)': {
      __id: 'client:root:todos(first:10)',
      __resolverError: null,
      __resolverLiveStateDirty: false,
      __resolverLiveStateSubscription: expect.anything(),
      __resolverLiveStateValue: {
        read: expect.anything(),
        subscribe: expect.anything(),
      },
      __resolverOutputTypeRecordIDs: new Set([
        'client:TodoConnection:client:root:todos(first:10)',
        'client:TodoConnection:client:root:todos(first:10):edges:0',
        'client:TodoConnection:client:root:todos(first:10):edges:0:node',
        'client:TodoConnection:client:root:todos(first:10):pageInfo',
      ]),
      __resolverSnapshot: undefined,
      __resolverValue: 'client:TodoConnection:client:root:todos(first:10)',
      __typename: '__RELAY_RESOLVER__',
    },
    'client:TodoConnection:client:root:todos(first:10)': {
      __id: 'client:TodoConnection:client:root:todos(first:10)',
      __typename: 'TodoConnection',
      count: 1,
      edges: {
        __refs: ['client:TodoConnection:client:root:todos(first:10):edges:0'],
      },
      pageInfo: {
        __ref: 'client:TodoConnection:client:root:todos(first:10):pageInfo',
      },
    },
    'client:TodoConnection:client:root:todos(first:10):edges:0': {
      __id: 'client:TodoConnection:client:root:todos(first:10):edges:0',
      __typename: 'TodoEdge',
      cursor: null,
      node: {
        __ref: 'client:TodoConnection:client:root:todos(first:10):edges:0:node',
      },
    },
    'client:TodoConnection:client:root:todos(first:10):edges:0:node': {
      __id: 'client:TodoConnection:client:root:todos(first:10):edges:0:node',
      __typename: 'Todo',
      complete: {
        __ref:
          'client:TodoConnection:client:root:todos(first:10):edges:0:node:complete',
      },
      self: {
        __ref:
          'client:TodoConnection:client:root:todos(first:10):edges:0:node:self',
      },
      text: {
        __ref:
          'client:TodoConnection:client:root:todos(first:10):edges:0:node:text',
      },
      todo_id: 'todo-1',
    },
    'client:TodoConnection:client:root:todos(first:10):pageInfo': {
      __id: 'client:TodoConnection:client:root:todos(first:10):pageInfo',
      __typename: 'TodoConnectionPageInfo',
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
    },
  });

  expect(() => {
    TestRenderer.act(() => {
      renderer.update(
        <EnvironmentWrapper environment={environment} key="1">
          <TodoListComponent />
        </EnvironmentWrapper>,
      );
    });
  }).not.toThrow();
});

test('render with recursive resolvers (with blocked_by)', () => {
  addTodo('My first todo');
  addTodo('My second todo');
  addTodo('My 3rd todo');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <TodoListComponent />
        <TodoRootWithBlockedComponent todoID="todo-1" />
      </EnvironmentWrapper>,
    );
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My 3rd todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  TestRenderer.act(() => {
    blockedBy('todo-1', 'todo-2');
    jest.runAllImmediates();
  });

  expect(renderer?.toJSON()).toEqual([
    'My first todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My 3rd todo',
    'is not completed',
    'style: bold',
    'color: color is red',
    'My second todo',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});

// TODO: T184433715 We currently break with the GraphQL spec here and filter out null values.
test('rendering lists with nulls', () => {
  addTodo('Todo 1');
  addTodo('Todo 2');
  addTodo('Todo 3');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <ManyTodosComponent todos={['todo-1', null, 'todo-2']} />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual([
    'Todo 1',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Todo 2',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
  TestRenderer.act(() => {
    renderer.update(
      <EnvironmentWrapper environment={environment}>
        <ManyTodosComponent todos={['todo-1', 'todo-2', 'todo-3']} />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual([
    'Todo 1',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Todo 2',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Todo 3',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});

test('rendering live list', () => {
  addTodo('Todo 1');
  addTodo('Todo 2');
  addTodo('Todo 3');
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <ManyLiveTodosComponent />
      </EnvironmentWrapper>,
    );
  });

  expect(renderer?.toJSON()).toEqual([
    'Todo 1',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Todo 2',
    'is not completed',
    'style: bold',
    'color: color is red',
    'Todo 3',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);

  TestRenderer.act(() => {
    removeTodo('todo-1');
    removeTodo('todo-2');
    jest.runAllImmediates();
  });

  expect(renderer?.toJSON()).toEqual([
    'Todo 3',
    'is not completed',
    'style: bold',
    'color: color is red',
  ]);
});
